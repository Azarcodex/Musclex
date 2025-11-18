import PDFDocument from "pdfkit";
import User from "../../models/users/user.js";
import Order from "../../models/users/order.js";
import Product from "../../models/products/Product.js";
import Variant from "../../models/products/Variant.js";

export const getInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1. Fetch order
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).send("Order not found");

    // 2. Fetch user
    const user = await User.findById(order.userID);

    // 3. Get detailed item info
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

    // 4. Create PDF
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderId}.pdf`
    );

    doc.pipe(res);

    // ---------------- HEADER ----------------
    doc.fontSize(22).text("INVOICE", { align: "center" });
    doc.moveDown();

    doc
      .fontSize(12)
      .text(`Order ID: ${order.orderId}`)
      .text(`Order Date: ${new Date(order.createdAt).toDateString()}`)
      .moveDown();

    // ---------------- CUSTOMER ----------------
    doc.fontSize(16).text("Customer Details", { underline: true });
    doc
      .fontSize(12)
      .text(order.shippingAddress.fullName)
      .text(order.shippingAddress.addressLine)
      .text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`)
      .text(`Pincode: ${order.shippingAddress.pincode}`)
      .text(`Phone: ${order.shippingAddress.phone}`)
      .moveDown();

    // ---------------- ITEMS ----------------
    doc.fontSize(16).text("Items", { underline: true });
    doc.moveDown(0.5);

    detailedItems.forEach((item) => {
      doc
        .fontSize(12)
        .text(`Product: ${item.name}`)
        .text(`Variant: ${item.variant}`)
        .text(`Size: ${item.size}`)
        .text(`Qty: ${item.qty}`)
        .text(`Price: ₹${item.price}`)
        .text(`Total: ₹${item.total}`)
        .moveDown();
    });

    // ---------------- TOTAL ----------------
    doc.fontSize(16).text("Summary", { underline: true }).moveDown(0.5);

    doc
      .fontSize(12)
      .text(`Subtotal: ₹${order.totalPrice}`)
      .text(`Discount: ₹${order.discount}`)
      .text(`Final Amount: ₹${order.finalAmount}`, { bold: true })
      .moveDown();

    // ---------------- FOOTER ----------------
    doc
      .moveDown(2)
      .fontSize(12)
      .text("Thank you for shopping with us!", { align: "center" });

    doc.end();
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
