import PDFDocument from "pdfkit";
import Order from "../../models/users/order.js";
import mongoose from "mongoose";

export const salesReportPdf = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { filter } = req.body || {};
    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    // -------------------------
    // DATE FILTER
    // -------------------------
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
    // PIPELINE (same as your salesReport)
    // -------------------------
    const pipeline = [
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

      { $match: { "orderedItems.status": "Delivered" } },

      {
        $lookup: {
          from: "variants",
          localField: "orderedItems.variantID",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: "$variant" },
    ];

    const rows = await Order.aggregate([
      ...pipeline,
      {
        $project: {
          orderId: "$_id",
          date: "$createdAt",
          product: "$product.name",
          flavour: "$variant.flavour",
          qty: "$orderedItems.quantity",
          price: "$orderedItems.price",
        },
      },
    ]);

    // -------------------------
    // START PDF
    // -------------------------
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales-report.pdf"
    );

    doc.pipe(res);

    // -------------------------
    // TITLE
    // -------------------------
    doc.fontSize(22).text("Sales Report", { align: "center" }).moveDown(1);

    doc.fontSize(10).text(`Vendor ID: ${vendorId}`, { align: "left" });
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    // -------------------------
    // TABLE HEADER
    // -------------------------
    const leftX = 40;
    let y = doc.y + 20;

    const col = {
      orderId: { x: leftX, width: 120 },
      date: { x: leftX + 125, width: 90 },
      product: { x: leftX + 220, width: 160 },
      qty: { x: leftX + 385, width: 50 },
      price: { x: leftX + 440, width: 80 },
      total: { x: leftX + 525, width: 80 },
    };

    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("Order ID", col.orderId.x, y, { width: col.orderId.width });
    doc.text("Date", col.date.x, y, { width: col.date.width });
    doc.text("Product", col.product.x, y, { width: col.product.width });
    doc.text("Qty", col.qty.x, y, { width: col.qty.width, align: "right" });
    doc.text("Price", col.price.x, y, {
      width: col.price.width,
      align: "right",
    });
    doc.text("Total", col.total.x, y, {
      width: col.total.width,
      align: "right",
    });

    y += 20;
    doc.moveTo(leftX, y).lineTo(570, y).stroke();
    y += 10;

    doc.font("Helvetica").fontSize(10);

    // -------------------------
    // TABLE ROWS
    // -------------------------
    rows.forEach((item) => {
      const total = Number(item.price) * Number(item.qty);

      doc.text(item.orderId.toString(), col.orderId.x, y, {
        width: col.orderId.width,
      });

      doc.text(new Date(item.date).toLocaleDateString("en-IN"), col.date.x, y, {
        width: col.date.width,
      });

      doc.text(`${item.product} (${item.flavour})`, col.product.x, y, {
        width: col.product.width,
      });

      doc.text(String(item.qty), col.qty.x, y, {
        width: col.qty.width,
        align: "right",
      });

      doc.text(`₹${item.price}`, col.price.x, y, {
        width: col.price.width,
        align: "right",
      });

      doc.text(`₹${total}`, col.total.x, y, {
        width: col.total.width,
        align: "right",
      });

      y += 20;

      if (y > 750) {
        doc.addPage();
        y = 50;
      }
    });

    doc.end();
  } catch (error) {
    console.error("PDF Error:", error);
    return res.status(500).json({ message: "Failed to generate PDF" });
  }
};
