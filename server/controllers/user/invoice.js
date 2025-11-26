import PDFDocument from "pdfkit";
import User from "../../models/users/user.js";
import Order from "../../models/users/order.js";
import Product from "../../models/products/Product.js";
import Variant from "../../models/products/Variant.js";

export const getInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId });
    if (!order) return res.status(404).send("Order not found");

    const user = await User.findById(order.userID);

    const detailedItems = await Promise.all(
      order.orderedItems.map(async (item) => {
        const product = await Product.findById(item.productID);
        const variant = await Variant.findById(item.variantID);

        return {
          name: product?.productName || "Unknown Product",
          variant: variant?.variantName || "",
          size: item.sizeLabel,
          qty: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
        };
      })
    );

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderId}.pdf`
    );

    doc.pipe(res);

    // ======================================================
    // HEADER
    // ======================================================
    doc
      .fontSize(22)
      .text("INVOICE", { align: "center", underline: true })
      .moveDown(1);

    doc
      .fontSize(12)
      .text(`Order ID: ${order.orderId}`)
      .text(`Order Date: ${new Date(order.createdAt).toDateString()}`)
      .moveDown(1.5);

    // ======================================================
    // CUSTOMER DETAILS
    // ======================================================
    doc.fontSize(16).text("Customer Details", { underline: true });
    doc
      .fontSize(12)
      .text(order.shippingAddress.fullName)
      .text(order.shippingAddress.addressLine)
      .text(
        `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`
      )
      .text(`Phone: ${order.shippingAddress.phone}`)
      .moveDown(1.5);

    // ======================================================
    // ITEMS TABLE
    // ======================================================

    // Table Header
    const tableTop = doc.y;
    const columnWidths = {
      name: 150,
      variant: 80,
      size: 50,
      qty: 50,
      price: 80,
      total: 80,
    };

    // header background
    doc.rect(40, tableTop, 520, 25).fill("#f0f0f0").stroke();

    doc
      .fillColor("#000")
      .fontSize(12)
      .text("Product", 45, tableTop + 7, { width: columnWidths.name })
      .text("Variant", 45 + columnWidths.name, tableTop + 7, {
        width: columnWidths.variant,
      })
      .text(
        "Size",
        45 + columnWidths.name + columnWidths.variant,
        tableTop + 7,
        {
          width: columnWidths.size,
        }
      )
      .text(
        "Qty",
        45 + columnWidths.name + columnWidths.variant + columnWidths.size,
        tableTop + 7,
        { width: columnWidths.qty }
      )
      .text(
        "Price",
        45 +
          columnWidths.name +
          columnWidths.variant +
          columnWidths.size +
          columnWidths.qty,
        tableTop + 7,
        { width: columnWidths.price }
      )
      .text(
        "Total",
        45 +
          columnWidths.name +
          columnWidths.variant +
          columnWidths.size +
          columnWidths.qty +
          columnWidths.price,
        tableTop + 7,
        { width: columnWidths.total }
      );

    doc.moveDown();
    let y = tableTop + 30;

    // Table Rows
    detailedItems.forEach((item, i) => {
      doc
        .fillColor("#000")
        .fontSize(11)
        .text(item.name, 45, y, { width: columnWidths.name })
        .text(item.variant, 45 + columnWidths.name, y, {
          width: columnWidths.variant,
        })
        .text(item.size, 45 + columnWidths.name + columnWidths.variant, y, {
          width: columnWidths.size,
        })
        .text(
          item.qty,
          45 + columnWidths.name + columnWidths.variant + columnWidths.size,
          y,
          {
            width: columnWidths.qty,
          }
        )
        .text(
          `₹${item.price}`,
          45 +
            columnWidths.name +
            columnWidths.variant +
            columnWidths.size +
            columnWidths.qty,
          y,
          { width: columnWidths.price }
        )
        .text(
          `₹${item.total}`,
          45 +
            columnWidths.name +
            columnWidths.variant +
            columnWidths.size +
            columnWidths.qty +
            columnWidths.price,
          y,
          { width: columnWidths.total }
        );

      y += 25;
      doc
        .moveTo(40, y - 5)
        .lineTo(560, y - 5)
        .stroke("#ddd");
    });

    doc.moveDown(2);

    // ======================================================
    // SUMMARY TABLE
    // ======================================================
    doc.fontSize(16).text("Summary", { underline: true }).moveDown(0.5);

    const summaryX = 300;
    let summaryY = doc.y;

    const summaryRows = [
      { label: "Subtotal", value: order.totalPrice },
      { label: "Discount", value: order.discount },
      { label: "Final Amount", value: order.finalAmount },
    ];

    summaryRows.forEach((row) => {
      doc
        .fontSize(12)
        .text(row.label, summaryX, summaryY)
        .text(`₹${row.value}`, summaryX + 150, summaryY, { align: "right" });

      summaryY += 20;
    });

    // ======================================================
    // FOOTER
    // ======================================================
    doc.moveDown(3).fontSize(12).text("Thank you for shopping with us!", {
      align: "center",
    });

    doc.end();
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
