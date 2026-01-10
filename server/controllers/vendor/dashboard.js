import mongoose from "mongoose";
import Order from "../../models/users/order.js";

/* =========================
   MAIN DASHBOARD CONTROLLER
========================= */
export const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    res.json({
      success: true,
      summary: await getVendorSummary(vendorId),
      topProducts: await getVendorTopProducts(vendorId),
      chartData: await getVendorChartData(vendorId),
    });
  } catch (error) {
    console.error("Vendor Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Vendor dashboard loading failed",
    });
  }
};

/* =========================
   SUMMARY
========================= */

export const getVendorSummary = async (vendorId) => {
  const data = await Order.aggregate([
    { $unwind: "$orderedItems" },

    // 🔑 JOIN PRODUCT (AUTHORITATIVE VENDOR SOURCE)
    {
      $lookup: {
        from: "products",
        localField: "orderedItems.productID",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // 🔑 MATCH LIKE SALES REPORT
    {
      $match: {
        "product.vendorID": new mongoose.Types.ObjectId(vendorId),
        "orderedItems.status": "Delivered",
      },
    },

    // 🔑 PER-ITEM CALCULATION (NO GROUP YET)
    {
      $project: {
        qty: "$orderedItems.quantity",
        price: { $toDouble: "$orderedItems.price" },
        discount: { $ifNull: ["$orderedItems.discountPerItem", 0] },
        commissionPercent: {
          $divide: [{ $ifNull: ["$orderedItems.commissionPercent", 10] }, 100],
        },
      },
    },

    // 🔑 ROUND PER ITEM (HALF UP — MATCH SALES REPORT)
    {
      $project: {
        qty: 1,

        vendorEarning: {
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
              0.5,
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

        originalRevenue: {
          $subtract: [
            { $multiply: ["$qty", "$price"] },
            { $multiply: ["$qty", "$discount"] },
          ],
        },
      },
    },

    // 🔑 FINAL SUM (ALREADY ROUNDED)
    {
      $group: {
        _id: null,

        // ✅ TOTAL UNITS SOLD
        totalSold: { $sum: "$qty" },

        totalRevenue: { $sum: "$originalRevenue" },
        totalCommission: { $sum: "$commission" },
        totalProfit: { $sum: "$vendorEarning" },
      },
    },

    {
      $project: {
        _id: 0,
        totalSold: 1,
        totalRevenue: 1,
        totalCommission: 1,
        totalProfit: 1,
      },
    },
  ]);

  return (
    data[0] || {
      totalSold: 0,
      totalRevenue: 0,
      totalCommission: 0,
      totalProfit: 0,
    }
  );
};

/* =========================
   TOP PRODUCTS
========================= */
const getVendorTopProducts = async (vendorId) => {
  return await Order.aggregate([
    { $unwind: "$orderedItems" },

    {
      $match: {
        "orderedItems.vendorID": new mongoose.Types.ObjectId(vendorId),
        "orderedItems.status": "Delivered",
      },
    },

    {
      $lookup: {
        from: "products",
        localField: "orderedItems.productID",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    {
      $group: {
        _id: "$product._id",
        productName: { $first: "$product.name" },
        totalSold: { $sum: "$orderedItems.quantity" },
        revenue: {
          $sum: {
            $multiply: ["$orderedItems.price", "$orderedItems.quantity"],
          },
        },
      },
    },

    { $sort: { totalSold: -1 } },
    { $limit: 10 },
  ]);
};

/* =========================
   CHART DATA
========================= */
const getVendorChartData = async (vendorId) => {
  return {
    weekly: await getVendorWeeklyRevenue(vendorId),
    monthly: await getVendorMonthlyRevenue(vendorId),
    yearly: await getVendorYearlyRevenue(vendorId),
  };
};

/* =========================
   HELPERS
========================= */
const getLast7Days = () => {
  const days = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  return days;
};

const profitExpression = {
  $subtract: [
    {
      $subtract: [
        {
          $multiply: ["$orderedItems.price", "$orderedItems.quantity"],
        },
        {
          $multiply: [
            { $ifNull: ["$orderedItems.discountPerItem", 0] },
            "$orderedItems.quantity",
          ],
        },
      ],
    },
    {
      $multiply: [
        {
          $multiply: ["$orderedItems.price", "$orderedItems.quantity"],
        },
        {
          $divide: [{ $ifNull: ["$orderedItems.commissionPercent", 0] }, 100],
        },
      ],
    },
  ],
};

/* =========================
   WEEKLY
========================= */
const getVendorWeeklyRevenue = async (vendorId) => {
  const fromDate = new Date();
  fromDate.setUTCDate(fromDate.getUTCDate() - 6);
  fromDate.setUTCHours(0, 0, 0, 0);

  const data = await Order.aggregate([
    { $unwind: "$orderedItems" },

    // 🔑 JOIN PRODUCT (AUTHORITATIVE VENDOR SOURCE)
    {
      $lookup: {
        from: "products",
        localField: "orderedItems.productID",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // 🔑 MATCH LIKE SALES REPORT
    {
      $match: {
        "product.vendorID": new mongoose.Types.ObjectId(vendorId),
        "orderedItems.status": "Delivered",
        createdAt: { $gte: fromDate },
      },
    },

    // 🔑 PER ITEM CALCULATION
    {
      $project: {
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "UTC",
          },
        },
        qty: "$orderedItems.quantity",
        price: { $toDouble: "$orderedItems.price" },
        discount: { $ifNull: ["$orderedItems.discountPerItem", 0] },
        commissionPercent: {
          $divide: [{ $ifNull: ["$orderedItems.commissionPercent", 10] }, 100],
        },
      },
    },

    // 🔑 ROUND PER ITEM (HALF UP)
    {
      $project: {
        date: 1,
        vendorEarning: {
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
              0.5,
            ],
          },
        },
      },
    },

    // 🔑 GROUP BY DAY (ALREADY ROUNDED)
    {
      $group: {
        _id: "$date",
        netRevenue: { $sum: "$vendorEarning" },
      },
    },
  ]);

  // 🔑 FORMAT LIKE ADMIN RESPONSE
  const labels = [];
  const values = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().split("T")[0];

    labels.push(days[d.getUTCDay()]);
    values.push(data.find((x) => x._id === key)?.netRevenue || 0);
  }

  return { labels, data: values };
};

/* =========================
   MONTHLY
========================= */
const getMonthsOfYear = () => Array.from({ length: 12 }, (_, i) => i + 1);

export const getVendorMonthlyRevenue = async (vendorId) => {
  const year = new Date().getUTCFullYear();

  const data = await Order.aggregate([
    { $unwind: "$orderedItems" },

    // 🔑 JOIN PRODUCT (AUTHORITATIVE VENDOR SOURCE)
    {
      $lookup: {
        from: "products",
        localField: "orderedItems.productID",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // 🔑 MATCH LIKE SALES REPORT
    {
      $match: {
        "product.vendorID": new mongoose.Types.ObjectId(vendorId),
        "orderedItems.status": "Delivered",
        createdAt: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`),
        },
      },
    },

    // 🔑 PER ITEM CALCULATION
    {
      $project: {
        month: { $month: { date: "$createdAt", timezone: "UTC" } },
        qty: "$orderedItems.quantity",
        price: { $toDouble: "$orderedItems.price" },
        discount: { $ifNull: ["$orderedItems.discountPerItem", 0] },
        commissionPercent: {
          $divide: [{ $ifNull: ["$orderedItems.commissionPercent", 10] }, 100],
        },
      },
    },

    // 🔑 ROUND PER ITEM (HALF UP)
    {
      $project: {
        month: 1,
        vendorEarning: {
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
              0.5,
            ],
          },
        },
      },
    },

    // 🔑 GROUP BY MONTH (ALREADY ROUNDED)
    {
      $group: {
        _id: "$month",
        netRevenue: { $sum: "$vendorEarning" },
      },
    },
  ]);

  // 🔑 ENSURE ALL 12 MONTHS EXIST
  const map = new Map(data.map((i) => [i._id, i.netRevenue]));

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    netRevenue: map.get(i + 1) ?? 0,
  }));

  return { monthly };
};

/* =========================
   YEARLY
========================= */
const getLastYears = (count = 5) => {
  const currentYear = new Date().getUTCFullYear();
  return Array.from({ length: count }, (_, i) => currentYear - (count - 1 - i));
};

export const getVendorYearlyRevenue = async (vendorId) => {
  const years = getLastYears(5);

  const data = await Order.aggregate([
    { $unwind: "$orderedItems" },

    // 🔑 JOIN PRODUCT (AUTHORITATIVE VENDOR SOURCE)
    {
      $lookup: {
        from: "products",
        localField: "orderedItems.productID",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // 🔑 MATCH LIKE SALES REPORT
    {
      $match: {
        "product.vendorID": new mongoose.Types.ObjectId(vendorId),
        "orderedItems.status": "Delivered",
      },
    },

    // 🔑 PER ITEM CALCULATION
    {
      $project: {
        year: { $year: { date: "$createdAt", timezone: "UTC" } },
        qty: "$orderedItems.quantity",
        price: { $toDouble: "$orderedItems.price" },
        discount: { $ifNull: ["$orderedItems.discountPerItem", 0] },
        commissionPercent: {
          $divide: [{ $ifNull: ["$orderedItems.commissionPercent", 10] }, 100],
        },
      },
    },

    // 🔑 ROUND PER ITEM (HALF UP)
    {
      $project: {
        year: 1,
        vendorEarning: {
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
              0.5,
            ],
          },
        },
      },
    },

    // 🔑 GROUP BY YEAR (ALREADY ROUNDED)
    {
      $group: {
        _id: "$year",
        netRevenue: { $sum: "$vendorEarning" },
      },
    },
  ]);

  // 🔑 ENSURE ALL YEARS EXIST
  const map = new Map(data.map((i) => [i._id, i.netRevenue]));

  const yearly = years.map((y) => ({
    year: y,
    netRevenue: map.get(y) ?? 0,
  }));

  return { yearly };
};
