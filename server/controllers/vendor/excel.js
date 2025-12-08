import XLSX from "xlsx";
import mongoose from "mongoose";
import Order from "../../models/users/order.js";

export const salesReportExcel = async (req, res) => {
  try {
    const vendorId = req.vendor._id; // or req.user._id
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor not identified" });
    }

    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
    const { filter } = req.body || {};

    // 🔹 Base match: only delivered orders
    const matchStage = {
      orderStatus: "Delivered",
    };

    // 🔹 Date filter (same as salesReport)
    if (filter && filter.type) {
      const now = new Date();
      let start, end;

      if (filter.type === "day") {
        end = now;
        start = new Date(now);
        start.setDate(now.getDate() - 1);
      } else if (filter.type === "week") {
        end = now;
        start = new Date(now);
        start.setDate(now.getDate() - 7);
      } else if (filter.type === "month") {
        end = now;
        start = new Date(now);
        start.setDate(now.getDate() - 30);
      } else if (filter.type === "range" && filter.from && filter.to) {
        start = new Date(filter.from + "T00:00:00.000Z");
        end = new Date(filter.to + "T23:59:59.999Z");
      }

      if (start && end) {
        matchStage.createdAt = { $gte: start, $lte: end };
      }
    }

    // 🔹 SAME PIPELINE AS salesReport, but no pagination
    const basePipeline = [
      { $match: matchStage },
      { $unwind: "$orderedItems" },

      // Lookup variant
      {
        $lookup: {
          from: "variants",
          localField: "orderedItems.variantID",
          foreignField: "_id",
          as: "variants",
        },
      },
      { $unwind: "$variants" },

      // Lookup product (vendor here)
      {
        $lookup: {
          from: "products",
          localField: "orderedItems.productID",
          foreignField: "_id",
          as: "products",
        },
      },
      { $unwind: "$products" },

      // 🔥 Filter for THIS vendor only
      {
        $match: {
          "products.vendorID": vendorObjectId,
        },
      },

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

      {
        $project: {
          _id: 0,
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

      { $sort: { orderDate: -1 } },
    ];

    const orders = await Order.aggregate(basePipeline);

    // -------- Summary calculation --------
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalItems = orders.reduce((sum, o) => sum + o.quantity, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // -------- Excel rows --------
    const excelData = orders.map((o) => ({
      "Order Date": new Date(o.orderDate).toLocaleString("en-IN"),
      Customer: o.customerName,
      Product: o.productName,
      Flavour: o.flavour,
      Size: o.sizeLabel,
      Qty: o.quantity,
      "Unit Price": o.price,
      Total: o.total,
    }));

    // Empty row
    excelData.push({});

    // Summary rows
    excelData.push({ "Order Date": "TOTAL REVENUE", Total: totalRevenue });
    excelData.push({ "Order Date": "TOTAL ORDERS", Total: totalOrders });
    excelData.push({
      "Order Date": "TOTAL PRODUCTS SOLD",
      Total: totalItems,
    });
    excelData.push({
      "Order Date": "AVERAGE ORDER VALUE",
      Total: avgOrderValue.toFixed(2),
    });

    // -------- Worksheet + column widths --------
    const ws = XLSX.utils.json_to_sheet(excelData);

    ws["!cols"] = Object.keys(excelData[0]).map((key) => ({
      wch: Math.max(key.length, 18),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "buffer",
    });

    const fileName = `sales_report_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Excel export failed" });
  }
};
