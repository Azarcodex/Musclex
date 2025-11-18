import Order from "../../models/users/order.js";

export const salesReport = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const totalCount = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $unwind: "$orderedItems" },
      { $count: "count" },
    ]);
    const totalPages = totalCount.length > 0 ? totalCount[0].count : 0;
    const orders = await Order.aggregate([
      {
        $match: { orderStatus: "Delivered" },
      },
      {
        $unwind: "$orderedItems",
      },
      {
        $lookup: {
          from: "products",
          localField: "orderedItems.productID",
          foreignField: "_id",
          as: "products",
        },
      },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "variants",
          localField: "orderedItems.variantID",
          foreignField: "_id",
          as: "variants",
        },
      },
      {
        $unwind: "$variants",
      },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $project: {
          _id: 0,
          orderId: "$_orderId",
          orderDate: "$createdAt",
          customerName: "$customer.name",
          productName: "$products.name",
          flavour: "$variants.flavour",
          sizeLabel: "$orderedItems.sizeLabel",
          quantity: "$orderedItems.quantity",
          price: "$orderedItems.price",
          total: {
            $multiply: ["$orderedItems.quantity", "$orderedItems.price"],
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    //summary
    const overall = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $unwind: "$orderedItems" },
      {
        $project: {
          quantity: "$orderedItems.quantity",
          total: {
            $multiply: ["$orderedItems.quantity", "$orderedItems.price"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalProducts: { $sum: "$quantity" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    const summaryData = overall[0] || {
      totalRevenue: 0,
      totalProducts: 0,
      totalOrders: 0,
    };
    res.status(200).json({
      success: true,
      orders,
      current: page,
      totalPage: totalPages,
      tactic: summaryData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
