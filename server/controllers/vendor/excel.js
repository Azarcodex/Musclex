import XLSX from "xlsx";
import Order from "../../models/users/order.js";

export const salesReportExcel = async (req, res) => {
  try {
    // Fetch all delivered orders (full dataset)
    const orders = await Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $unwind: "$orderedItems" },

      {
        $lookup: {
          from: "products",
          localField: "orderedItems.productID",
          foreignField: "_id",
          as: "products"
        }
      },
      { $unwind: "$products" },

      {
        $lookup: {
          from: "variants",
          localField: "orderedItems.variantID",
          foreignField: "_id",
          as: "variants"
        }
      },
      { $unwind: "$variants" },

      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },

      {
        $project: {
          _id: 0,
          orderDate: "$createdAt",
          customerName: "$customer.fullName",
          productName: "$products.name",
          flavour: "$variants.flavour",
          sizeLabel: "$orderedItems.sizeLabel",
          quantity: "$orderedItems.quantity",
          price: "$orderedItems.price",
          total: {
            $multiply: [
              "$orderedItems.quantity",
              "$orderedItems.price"
            ]
          }
        }
      },

      { $sort: { orderDate: -1 } }
    ]);

    // Summary calculation
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalItems = orders.reduce((sum, o) => sum + o.quantity, 0);
    const totalOrders = orders.length;
    const avgOrderValue =
      totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const excelData = orders.map((o) => ({
      "Order Date": new Date(o.orderDate).toLocaleString(),
      "Customer": o.customerName,
      "Product": o.productName,
      "Flavour": o.flavour,
      "Size": o.sizeLabel,
      "Qty": o.quantity,
      "Unit Price": o.price,
      "Total": o.total
    }));

    excelData.push({});
    excelData.push({
      "Order Date": "TOTAL REVENUE",
      Total: totalRevenue
    });

    excelData.push({
      "Order Date": "TOTAL ORDERS",
      Total: totalOrders
    });

    excelData.push({
      "Order Date": "TOTAL PRODUCTS SOLD",
      Total: totalItems
    });

    excelData.push({
      "Order Date": "AVERAGE ORDER VALUE",
      Total: avgOrderValue.toFixed(2)
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Auto column width
    const colWidths = Object.keys(excelData[0]).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws["!cols"] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

    // Write workbook to buffer
    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "buffer",
    });

    // Set download headers
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Send file
    return res.send(buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Excel export failed" });
  }
};
