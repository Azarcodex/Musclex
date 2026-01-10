import Order from "../../models/users/order.js";
import mongoose from "mongoose";

export const salesReport = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor not identified" });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { filter } = req.body || {};
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
    // console.log(vendorObjectId, vendorId);
    // -------------------------
    // DATE FILTER

    const matchStage = {};

    if (filter && filter.type) {
      const now = new Date();
      let start, end;

      if (filter.type === "day") {
        end = now;
        start = new Date(now);
        start.setDate(start.getDate() - 1);
      } else if (filter.type === "week") {
        end = now;
        start = new Date(now);
        start.setDate(start.getDate() - 7);
      } else if (filter.type === "month") {
        end = now;
        start = new Date(now);
        start.setDate(start.getDate() - 30);
      } else if (filter.type === "range" && filter.from && filter.to) {
        start = new Date(filter.from + "T00:00:00Z");
        end = new Date(filter.to + "T23:59:59Z");
      }

      if (start && end) {
        matchStage.createdAt = { $gte: start, $lte: end };
      }
    }

    // -------------------------
    // BASE PIPELINE
    // -------------------------
    const basePipeline = [
      { $match: matchStage },

      // Unwind all items
      { $unwind: "$orderedItems" },

      // Join product first to identify vendor
      {
        $lookup: {
          from: "products",
          localField: "orderedItems.productID",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      // Only vendor items
      {
        $match: {
          "product.vendorID": vendorObjectId,
        },
      },

      // NOW filter ONLY delivered vendor items
      // {
      //   $match: {
      //     "orderedItems.status": "Delivered",
      //   },
      // },
      // Allow Delivered + Cancelled + Returned
      {
        $match: {
          "orderedItems.status": {
            $in: ["Delivered", "Cancelled", "Returned"],
          },
        },
      },

      // Lookup variant
      {
        $lookup: {
          from: "variants",
          localField: "orderedItems.variantID",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: "$variant" },

      // Lookup customer
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
    ];

    // COUNT
    const totalItems =
      (await Order.aggregate([...basePipeline, { $count: "count" }]))?.[0]
        ?.count || 0;

    const totalPages = Math.ceil(totalItems / limit) || 1;

    // LIST
    const orders = await Order.aggregate([
      ...basePipeline,
      {
        $match: {
          "orderedItems.status": {
            $in: ["Delivered", "Cancelled", "Returned"],
          },
        },
      },

      {
        $project: {
          _id: 0,
          rowKey: { $toString: "$orderedItems._id" },
          orderId: "$_id",
          orderDate: "$createdAt",
          customerName: "$customer.name",
          productName: "$product.name",
          flavour: {
            $cond: {
              if: {
                $eq: [{ $trim: { input: "$variant.flavour" } }, ""],
              },
              then: "no flavour",
              else: "$variant.flavour",
            },
          },
          sizeLabel: "$orderedItems.sizeLabel",
          quantity: "$orderedItems.quantity",

          price: { $toDouble: "$orderedItems.price" },

          originalTotal: {
            $multiply: [
              "$orderedItems.quantity",
              { $toDouble: "$orderedItems.price" },
            ],
          },

          couponDiscount: {
            $multiply: [
              "$orderedItems.quantity",
              { $ifNull: ["$orderedItems.discountPerItem", 0] },
            ],
          },

          commissionAmount: {
            $round: [
              {
                $multiply: [
                  {
                    $subtract: [
                      {
                        $multiply: [
                          "$orderedItems.price",
                          "$orderedItems.quantity",
                        ],
                      },
                      {
                        $multiply: [
                          "$orderedItems.quantity",
                          { $ifNull: ["$orderedItems.discountPerItem", 0] },
                        ],
                      },
                    ],
                  },
                  {
                    $divide: [
                      { $ifNull: ["$orderedItems.commissionPercent", 10] },
                      100,
                    ],
                  },
                ],
              },
              2,
            ],
          },

          vendorEarning: {
            $round: [
              {
                $subtract: [
                  {
                    $subtract: [
                      {
                        $multiply: [
                          "$orderedItems.price",
                          "$orderedItems.quantity",
                        ],
                      },
                      {
                        $multiply: [
                          "$orderedItems.quantity",
                          { $ifNull: ["$orderedItems.discountPerItem", 0] },
                        ],
                      },
                    ],
                  },
                  {
                    $multiply: [
                      {
                        $subtract: [
                          {
                            $multiply: [
                              "$orderedItems.price",
                              "$orderedItems.quantity",
                            ],
                          },
                          {
                            $multiply: [
                              "$orderedItems.quantity",
                              { $ifNull: ["$orderedItems.discountPerItem", 0] },
                            ],
                          },
                        ],
                      },
                      {
                        $divide: [
                          { $ifNull: ["$orderedItems.commissionPercent", 10] },
                          100,
                        ],
                      },
                    ],
                  },
                ],
              },
              2,
            ],
          },

          paymentMethod: "$paymentMethod",
          status: "$orderedItems.status",
        },
      },

      { $sort: { orderDate: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // SUMMARY
    // SUMMARY — DO NOT ROUND BEFORE GROUP
    // SUMMARY — ROUND PER ITEM, THEN SUM (MATCH ADMIN DASHBOARD)
    // SUMMARY
    const defaultSummary = {
      totalQty: 0,
      totalVendorEarning: 0,
      totalCommission: 0,
      totalOriginalRevenue: 0,
      totalCouponDiscount: 0,
    };

    const aggregationResult = (
      await Order.aggregate([
        ...basePipeline,
        {
          $match: {
            "orderedItems.status": "Delivered",
          },
        },
        {
          $project: {
            qty: "$orderedItems.quantity",
            price: { $toDouble: "$orderedItems.price" },
            discount: { $ifNull: ["$orderedItems.discountPerItem", 0] },
            commissionPercent: {
              $divide: [
                { $ifNull: ["$orderedItems.commissionPercent", 10] },
                100,
              ],
            },
          },
        },

        // ✅ FIXED ROUNDING LOGIC (Round Half Up)
        {
          $project: {
            vendorEarning: {
              // CHANGE: Using $floor($add: [value, 0.5]) forces 598.5 -> 599
              $floor: {
                $add: [
                  {
                    $subtract: [
                      {
                        $subtract: [
                          { $multiply: ["$qty", "$price"] },
                          { $multiply: ["$qty", "$discount"] },
                        ],
                      },
                      {
                        $multiply: [
                          {
                            $subtract: [
                              { $multiply: ["$qty", "$price"] },
                              { $multiply: ["$qty", "$discount"] },
                            ],
                          },
                          "$commissionPercent",
                        ],
                      },
                    ],
                  },
                  0.5, // Adding 0.5 before flooring ensures .5 rounds UP
                ],
              },
            },

            commission: {
              $round: [
                {
                  $multiply: [
                    {
                      $subtract: [
                        { $multiply: ["$qty", "$price"] },
                        { $multiply: ["$qty", "$discount"] },
                      ],
                    },
                    "$commissionPercent",
                  ],
                },
                0,
              ],
            },

            couponDiscount: { $multiply: ["$qty", "$discount"] },
            qty: 1,
          },
        },

        // ✅ SUM ALREADY-ROUNDED VALUES
        {
          $group: {
            _id: null,
            totalQty: { $sum: "$qty" },
            totalVendorEarning: { $sum: "$vendorEarning" },
            totalCommission: { $sum: "$commission" },
            totalCouponDiscount: { $sum: "$couponDiscount" },
          },
        },

        {
          $project: {
            _id: 0,
            totalQty: 1,
            totalVendorEarning: 1,
            totalCommission: 1,
            totalOriginalRevenue: {
              $add: ["$totalVendorEarning", "$totalCommission"],
            },
            totalCouponDiscount: 1,
          },
        },
      ])
    )?.[0];
    const summary = aggregationResult || defaultSummary;

    //for cancelled and returned track
    const cancelledReturnedTotals = await Order.aggregate([
      ...basePipeline,

      {
        $match: {
          "orderedItems.status": { $in: ["Cancelled", "Returned"] },
        },
      },

      {
        $project: {
          status: "$orderedItems.status",
          amount: {
            $subtract: [
              {
                $multiply: [
                  "$orderedItems.quantity",
                  { $toDouble: "$orderedItems.price" },
                ],
              },
              {
                $multiply: [
                  "$orderedItems.quantity",
                  { $ifNull: ["$orderedItems.discountPerItem", 0] },
                ],
              },
            ],
          },
        },
      },

      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const statusBoxes = {
      cancelledTotal: 0,
      returnedTotal: 0,
    };

    cancelledReturnedTotals.forEach((item) => {
      if (item._id === "Cancelled")
        statusBoxes.cancelledTotal = item.totalAmount;
      if (item._id === "Returned") statusBoxes.returnedTotal = item.totalAmount;
    });

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        current: page,
        totalPages,
        totalItems,
      },
      totals: {
        totalQuantity: summary.totalQty || 0,
        totalOriginalRevenue: summary.totalOriginalRevenue || 0,
        totalDiscount: summary.totalCouponDiscount || 0,
        totalCommission: summary.totalCommission,
        totalVendorEarning: summary.totalVendorEarning || 0,
      },
      summary,
      statusBoxes,
    });
  } catch (error) {
    console.error("Sales Report Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
