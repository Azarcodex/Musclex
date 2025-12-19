import Order from "../../models/users/order.js";
import MESSAGES from "../../constants/messages.js";

const ADMIN_COMMISSION_RATE = 0.1;

/**
 * MAIN DASHBOARD CONTROLLER
 */
export const getDashboard = async (req, res) => {
  try {
    const summary = await getPlatformSummary();

    res.json({
      success: true,
      summary, // 🔥 platform, admin, vendor split
      topProducts: await getTopProducts(),
      topCategories: await getTopCategories(),
      topBrands: await getTopVendors(),
      chartData: await getChartData(),
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: MESSAGES.DASHBOARD_LOADING_FAILED,
    });
  }
};

/* ---------------------------------------------------------
    🔥 PLATFORM SUMMARY (MOST IMPORTANT)
----------------------------------------------------------*/
const getPlatformSummary = async () => {
  const result = await Order.aggregate([
    { $unwind: "$orderedItems" },

    { $match: { "orderedItems.status": "Delivered" } },

    {
      $group: {
        _id: null,
        grossAmount: {
          $sum: {
            $multiply: ["$orderedItems.price", "$orderedItems.quantity"],
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        grossAmount: 1,
        adminAmount: {
          $multiply: ["$grossAmount", ADMIN_COMMISSION_RATE],
        },
        vendorAmount: {
          $multiply: ["$grossAmount", 1 - ADMIN_COMMISSION_RATE],
        },
      },
    },
  ]);

  return (
    result[0] || {
      grossAmount: 0,
      adminAmount: 0,
      vendorAmount: 0,
    }
  );
};

/* ---------------------------------------------------------
    🔥 TOP PRODUCTS
----------------------------------------------------------*/
const getTopProducts = async () => {
  try {
    return await Order.aggregate([
      { $unwind: "$orderedItems" },
      { $match: { "orderedItems.status": "Delivered" } },

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
          name: { $first: "$product.name" },
          totalSold: { $sum: "$orderedItems.quantity" },
        },
      },

      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);
  } catch {
    return [];
  }
};

/* ---------------------------------------------------------
    🔥 TOP CATEGORIES (GROSS REVENUE)
----------------------------------------------------------*/
const getTopCategories = async () => {
  try {
    return await Order.aggregate([
      { $unwind: "$orderedItems" },
      { $match: { "orderedItems.status": "Delivered" } },

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
        $lookup: {
          from: "categories",
          localField: "product.catgid",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.catgName" },
          grossRevenue: {
            $sum: {
              $multiply: ["$orderedItems.price", "$orderedItems.quantity"],
            },
          },
        },
      },

      { $sort: { grossRevenue: -1 } },
      { $limit: 10 },
    ]);
  } catch {
    return [];
  }
};

/* ---------------------------------------------------------
    🔥 TOP BRANDS / VENDORS (FIXED & AUTHORITATIVE)
----------------------------------------------------------*/
const getTopVendors = async () => {
  try {
    return await Order.aggregate([
      { $unwind: "$orderedItems" },

      { $match: { "orderedItems.status": "Delivered" } },

      // Join product to get vendorID (authoritative)
      {
        $lookup: {
          from: "products",
          localField: "orderedItems.productID",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      // Group by vendor
      {
        $group: {
          _id: "$product.vendorID",
          grossRevenue: {
            $sum: {
              $multiply: ["$orderedItems.price", "$orderedItems.quantity"],
            },
          },
          qtySold: { $sum: "$orderedItems.quantity" },
        },
      },

      { $sort: { grossRevenue: -1 } },
      { $limit: 10 },

      // 🔑 Join vendor collection to get shopName
      {
        $lookup: {
          from: "vendors", // 👈 collection name
          localField: "_id", // vendorID
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: "$vendor" },

      // Final shape
      {
        $project: {
          _id: 0,
          vendorID: "$_id",
          shopName: "$vendor.shopName", // 👈 THIS is what you asked for
          grossRevenue: 1,
          adminAmount: {
            $multiply: ["$grossRevenue", ADMIN_COMMISSION_RATE],
          },
          vendorAmount: {
            $multiply: ["$grossRevenue", 1 - ADMIN_COMMISSION_RATE],
          },
          qtySold: 1,
        },
      },
    ]);
  } catch (err) {
    console.error(err);
    return [];
  }
};

/* ---------------------------------------------------------
     CHART DATA
----------------------------------------------------------*/
const getChartData = async () => {
  return {
    weekly: await getWeeklyRevenue(),
    monthly: await getMonthlyRevenue(),
    yearly: await getYearlyRevenue(),
  };
};

/* ---------------------------------------------------------
     WEEKLY REVENUE (GROSS)
----------------------------------------------------------*/
const getWeeklyRevenue = async () => {
  const fromDate = new Date();
  fromDate.setUTCDate(fromDate.getUTCDate() - 6);
  fromDate.setUTCHours(0, 0, 0, 0);

  const data = await Order.aggregate([
    { $unwind: "$orderedItems" },
    {
      $match: {
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
            timezone: "UTC",
          },
        },
        grossRevenue: {
          $sum: {
            $multiply: ["$orderedItems.price", "$orderedItems.quantity"],
          },
        },
      },
    },
  ]);

  const labels = [];
  const values = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().split("T")[0];

    labels.push(days[d.getUTCDay()]);
    values.push(data.find((x) => x._id === key)?.grossRevenue || 0);
  }

  return { labels, data: values };
};

/* ---------------------------------------------------------
     MONTHLY REVENUE (CURRENT YEAR ONLY)
----------------------------------------------------------*/
const getMonthlyRevenue = async () => {
  const year = new Date().getUTCFullYear();

  const data = await Order.aggregate([
    { $unwind: "$orderedItems" },
    { $match: { "orderedItems.status": "Delivered" } },

    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`),
        },
      },
    },

    {
      $group: {
        _id: { $month: "$createdAt" },
        grossRevenue: {
          $sum: {
            $multiply: ["$orderedItems.price", "$orderedItems.quantity"],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const values = Array(12).fill(0);

  data.forEach((d) => (values[d._id - 1] = d.grossRevenue));

  return { labels, data: values };
};

/* ---------------------------------------------------------
     YEARLY REVENUE (GROSS)
----------------------------------------------------------*/
const getYearlyRevenue = async () => {
  return await Order.aggregate([
    { $unwind: "$orderedItems" },
    { $match: { "orderedItems.status": "Delivered" } },

    {
      $group: {
        _id: { $year: "$createdAt" },
        grossRevenue: {
          $sum: {
            $multiply: ["$orderedItems.price", "$orderedItems.quantity"],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

export default {
  getDashboard,
};
