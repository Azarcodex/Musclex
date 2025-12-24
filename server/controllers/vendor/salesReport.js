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
      {
        $match: {
          "orderedItems.status": "Delivered",
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
            $multiply: [
              "$orderedItems.quantity",
              {
                $multiply: [
                  { $toDouble: "$orderedItems.price" },
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

          vendorEarning: {
            $subtract: [
              {
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
              {
                $multiply: [
                  "$orderedItems.quantity",
                  {
                    $multiply: [
                      { $toDouble: "$orderedItems.price" },
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
            ],
          },

          paymentMethod: "$paymentMethod",
        },
      },

      { $sort: { orderDate: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // SUMMARY
    const summary = (
      await Order.aggregate([
        ...basePipeline,
        {
          $project: {
            qty: "$orderedItems.quantity",
            price: { $toDouble: "$orderedItems.price" },
            discountPerItem: { $ifNull: ["$orderedItems.discountPerItem", 0] },
            commissionPercent: {
              $ifNull: ["$orderedItems.commissionPercent", 10],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalQty: { $sum: "$qty" },
            totalOriginalRevenue: { $sum: { $multiply: ["$qty", "$price"] } },
            totalCouponDiscount: {
              $sum: { $multiply: ["$qty", "$discountPerItem"] },
            },
            totalCommission: {
              $sum: {
                $multiply: [
                  "$qty",
                  {
                    $multiply: [
                      "$price",
                      { $divide: ["$commissionPercent", 100] },
                    ],
                  },
                ],
              },
            },
            totalVendorEarning: {
              $sum: {
                $subtract: [
                  {
                    $subtract: [
                      { $multiply: ["$qty", "$price"] },
                      { $multiply: ["$qty", "$discountPerItem"] },
                    ],
                  },
                  {
                    $multiply: [
                      "$qty",
                      {
                        $multiply: [
                          "$price",
                          { $divide: ["$commissionPercent", 100] },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      ])
    )?.[0] || {
      totalQty: 0,
      totalOriginalRevenue: 0,
      totalCouponDiscount: 0,
      totalCommission: 0,
      totalVendorEarning: 0,
    };

    // return res.status(200).json({
    //   success: true,
    //   orders,
    //   pagination: {
    //     current: page,
    //     totalPages,
    //     totalItems,
    //   },
    //   summary,
    // });
    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        current: page,
        totalPages,
        totalItems,
      },
      totals: {
        totalQuantity: summary.totalQty,
        totalOriginalRevenue: summary.totalOriginalRevenue,
        totalDiscount: summary.totalCouponDiscount,
        totalCommission: summary.totalCommission,
        totalVendorEarning: summary.totalVendorEarning,
      },
      summary,
    });
  } catch (error) {
    console.error("Sales Report Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
