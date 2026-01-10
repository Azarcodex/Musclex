import XLSX from "xlsx";
import mongoose from "mongoose";
import Order from "../../models/users/order.js";

export const salesReportExcel = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor not identified" });
    }

    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
    const { filter } = req.body || {};

    // -------------------------
    // DATE FILTER (same as your salesReport)
    // -------------------------
    const matchStage = {};

    if (filter?.type) {
      const now = new Date();
      let start, end;

      if (filter.type === "day") {
        end = now;
        start = new Date(now.setDate(now.getDate() - 1));
      } else if (filter.type === "week") {
        end = now;
        start = new Date(now.setDate(now.getDate() - 7));
      } else if (filter.type === "month") {
        end = now;
        start = new Date(now.setDate(now.getDate() - 30));
      } else if (filter.type === "range" && filter.from && filter.to) {
        start = new Date(filter.from + "T00:00:00Z");
        end = new Date(filter.to + "T23:59:59Z");
      }

      if (start && end) {
        matchStage.createdAt = { $gte: start, $lte: end };
      }
    }

    // -------------------------
    // BASE PIPELINE (same as salesReport)
    // -------------------------
    const basePipeline = [
      { $match: matchStage },

      { $unwind: "$orderedItems" },

      {
        $lookup: {
          from: "products",
          localField: "orderedItems.productID",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      { $match: { "product.vendorID": vendorObjectId } },

      {
        $match: {
          "orderedItems.status": {
            $in: ["Delivered", "Cancelled", "Returned"],
          },
        },
      },

      {
        $lookup: {
          from: "variants",
          localField: "orderedItems.variantID",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: "$variant" },

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

    // -------------------------
    // FETCH ALL ORDERS FOR EXCEL
    // -------------------------
    const orders = await Order.aggregate([
      ...basePipeline,
      {
        $project: {
          orderId: "$_id",
          orderDate: "$createdAt",
          customerName: "$customer.name",
          productName: "$product.name",
          // flavour: "$variant.flavour",
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
          discountPerItem: { $ifNull: ["$orderedItems.discountPerItem", 0] },
          commissionPercent: {
            $ifNull: ["$orderedItems.commissionPercent", 10],
          },

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
          orderStatus: "$orderedItems.status",
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
        },
      },
      { $sort: { orderDate: -1 } },
    ]);

    // -------------------------
    // EXCEL DATA FORMAT
    // -------------------------
    const roundMoney = (amount) => {
      const value = parseFloat(amount) || 0;
      return value.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      });
    };

    const excelData = orders.map((o) => ({
      "Order ID": o.orderId.toString(),
      "Order Date": new Date(o.orderDate).toLocaleString("en-IN"),
      Customer: o.customerName,
      Product: o.productName,
      Flavour: o.flavour,
      Size: o.sizeLabel,
      Qty: o.quantity,

      "Unit Price (₹)": roundMoney(o.price),
      "Original Total (₹)": roundMoney(o.originalTotal),
      "Coupon Discount (₹)": roundMoney(o.couponDiscount),
      "Commission (%)": o.commissionPercent,

      "Commission Amount (₹)": roundMoney(o.commissionAmount),
      "Vendor Earning (₹)": roundMoney(o.vendorEarning),

      Payment: o.paymentMethod,
      status: o.orderStatus,
    }));

    // -------------------------
    // EXCEL SHEET + AUTO COLUMN WIDTH
    // -------------------------
    const ws = XLSX.utils.json_to_sheet(excelData);

    ws["!cols"] = Object.keys(excelData[0]).map((key) => ({
      wch: Math.max(key.length, 20),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    const fileName = `sales_report_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Excel error:", error);
    return res.status(400).json({ message: "Failed to export Excel" });
  }
};
