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
const getVendorSummary = async (vendorId) => {
  const data = await Order.aggregate([
    { $unwind: "$orderedItems" },

    {
      $match: {
        "orderedItems.vendorID": new mongoose.Types.ObjectId(vendorId),
        "orderedItems.status": "Delivered",
      },
    },

    {
      $group: {
        _id: null,

        totalRevenue: {
          $sum: {
            $multiply: ["$orderedItems.price", "$orderedItems.quantity"],
          },
        },

        totalCommission: {
          $sum: {
            $multiply: [
              {
                $multiply: ["$orderedItems.price", "$orderedItems.quantity"],
              },
              {
                $divide: [
                  { $ifNull: ["$orderedItems.commissionPercent", 0] },
                  100,
                ],
              },
            ],
          },
        },

        totalProfit: {
          $sum: {
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
                      { $ifNull: ["$orderedItems.discountPerItem", 0] },
                      "$orderedItems.quantity",
                    ],
                  },
                ],
              },
              {
                $multiply: [
                  {
                    $multiply: [
                      "$orderedItems.price",
                      "$orderedItems.quantity",
                    ],
                  },
                  {
                    $divide: [
                      { $ifNull: ["$orderedItems.commissionPercent", 0] },
                      100,
                    ],
                  },
                ],
              },
            ],
          },
        },

        totalOrders: { $sum: 1 },
      },
    },
  ]);

  if (!data.length) {
    return {
      totalRevenue: 0,
      totalCommission: 0,
      totalProfit: 0,
      totalOrders: 0,
    };
  }

  return data[0];
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
export const getVendorWeeklyRevenue = async (vendorId) => {
  const fromDate = new Date();
  fromDate.setUTCDate(fromDate.getUTCDate() - 6);
  fromDate.setUTCHours(0, 0, 0, 0);

  const rawData = await Order.aggregate([
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

    {
      $match: {
        "product.vendorID": new mongoose.Types.ObjectId(vendorId),
        "orderedItems.status": "Delivered",
        createdAt: { $gte: fromDate },
      },
    },

    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        profit: {
          $sum: {
            $multiply: [profitExpression, 0.9], // 🔻 10% admin commission
          },
        },
      },
    },
  ]);

  const map = new Map(rawData.map((i) => [i._id, i.profit]));

  const weekly = getLast7Days().map((d) => ({
    _id: d,
    profit: map.get(d) ?? 0,
  }));

  return { weekly };
};

/* =========================
   MONTHLY
========================= */
const getMonthsOfYear = () => Array.from({ length: 12 }, (_, i) => i + 1);

export const getVendorMonthlyRevenue = async (vendorId) => {
  const year = new Date().getUTCFullYear();

  const rawData = await Order.aggregate([
    { $unwind: "$orderedItems" },

    // 🔑 Join product (authoritative vendor source)
    {
      $lookup: {
        from: "products",
        localField: "orderedItems.productID",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // 🔑 Match vendor EXACTLY like sales report
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

    {
      $group: {
        _id: { $month: { date: "$createdAt", timezone: "UTC" } },
        profit: {
          $sum: {
            $multiply: [profitExpression, 0.9], // 🔻 10% admin commission
          },
        },
      },
    },
  ]);

  const map = new Map(rawData.map((i) => [i._id, i.profit]));

  const monthly = getMonthsOfYear().map((m) => ({
    _id: m,
    profit: map.get(m) ?? 0,
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

  const rawData = await Order.aggregate([
    { $unwind: "$orderedItems" },

    // 🔑 Join product to get correct vendor
    {
      $lookup: {
        from: "products",
        localField: "orderedItems.productID",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // 🔑 Match vendor EXACTLY like sales report
    {
      $match: {
        "product.vendorID": new mongoose.Types.ObjectId(vendorId),
        "orderedItems.status": "Delivered",
      },
    },

    {
      $group: {
        _id: { $year: { date: "$createdAt", timezone: "UTC" } },
        profit: {
          $sum: {
            $multiply: [profitExpression, 0.9], // 🔻 10% admin commission
          },
        },
      },
    },
  ]);

  const map = new Map(rawData.map((i) => [i._id, i.profit]));

  const yearly = years.map((y) => ({
    _id: y,
    profit: map.get(y) ?? 0,
  }));

  return { yearly };
};

//step-1
