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

    // --- Aesthetic Configuration ---
    const primaryColor = "#3a7bd5"; // A professional blue
    const secondaryColor = "#555555"; // Darker grey for body text
    const lightGrey = "#eeeeee"; // Very light grey for backgrounds/lines
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
    // Company/Store Name (Assuming a placeholder for a logo/branding)
    doc
      .fontSize(28)
      .fillColor(primaryColor)
      .font("Helvetica-Bold") // Use a bold font for the title
      .text("MUSCLEX STORE", 40, 50);

    // Invoice Title
    doc
      .fontSize(22)
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .text("INVOICE", { align: "right" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor(secondaryColor)
      .font("Helvetica")
      .text(`Date: ${new Date(order.createdAt).toDateString()}`, {
        align: "right",
      })
      .text(`Invoice No: ${order.orderId}`, { align: "right" });

    doc.moveDown(1);
    doc
      .strokeColor(lightGrey)
      .lineWidth(1)
      .moveTo(40, doc.y)
      .lineTo(560, doc.y)
      .stroke(); // Separator line
    doc.moveDown(1);

    // ======================================================
    // CUSTOMER DETAILS & BILLING/SHIPPING
    // ======================================================
    const detailY = doc.y;
    const detailX = 40;

    // Billing/Shipping Title
    doc
      .fontSize(14)
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .text("Shipping Address", detailX, detailY)
      .moveDown(0.5);

    // Customer Details
    doc
      .fontSize(11)
      .fillColor(secondaryColor)
      .font("Helvetica")
      .font("Helvetica")
      .text(order.shippingAddress.fullName, detailX)
      .text(order.shippingAddress.addressLine, detailX)
      .text(
        `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
        detailX
      )
      .text(`Phone: ${order.shippingAddress.phone}`, detailX);

    doc.moveDown(1.5);

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

    // Header background with primary color and white text for high contrast
    doc.rect(40, tableTop, 520, 25).fill(primaryColor).stroke();

    doc
      .fillColor("#ffffff") // White text for header
      .fontSize(11) // Slightly smaller font for table header
      .font("Helvetica-Bold")
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
        "Price (Per Unit)",
        45 +
          columnWidths.name +
          columnWidths.variant +
          columnWidths.size +
          columnWidths.qty,
        tableTop + 7,
        { width: columnWidths.price }
      )
      .text(
        "Line Total",
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
      // Alternate row colors for better readability
      if (i % 2 === 0) {
        doc
          .rect(40, y - 5, 520, 20)
          .fill(lightGrey)
          .stroke(lightGrey);
      }

      doc
        .fillColor(secondaryColor)
        .fontSize(10)
        .font("Helvetica")
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
          `₹${item.price.toFixed(2)}`, // Format to 2 decimal places
          45 +
            columnWidths.name +
            columnWidths.variant +
            columnWidths.size +
            columnWidths.qty,
          y,
          { width: columnWidths.price }
        )
        .text(
          `₹${item.total.toFixed(2)}`, // Format to 2 decimal places
          45 +
            columnWidths.name +
            columnWidths.variant +
            columnWidths.size +
            columnWidths.qty +
            columnWidths.price,
          y,
          { width: columnWidths.total }
        );

      y += 20; // Reduced row height for a more compact look

      // If it's the last row, draw a line underneath it
      if (i === detailedItems.length - 1) {
        doc
          .moveTo(40, y + 5)
          .lineTo(560, y + 5)
          .stroke(primaryColor);
      }
    });

    doc.moveDown(1.5);

    // ======================================================
    // SUMMARY TABLE (Right-Aligned)
    // ======================================================
    const summaryX = 350; // Start summary further to the right
    let summaryY = doc.y;

    // Subtotal Row
    doc
      .fontSize(11)
      .fillColor(secondaryColor)
      .font("Helvetica")
      .text("Subtotal:", summaryX, summaryY, { width: 100, align: "right" })
      .text(`₹${order.totalPrice.toFixed(2)}`, summaryX + 110, summaryY, {
        width: 100,
        align: "right",
      });
    summaryY += 18;

    // Discount Row
    doc
      .fontSize(11)
      .fillColor("#e74c3c") // Red for discounts
      .font("Helvetica")
      .text("Discount:", summaryX, summaryY, { width: 100, align: "right" })
      .text(`- ₹${order.discount.toFixed(2)}`, summaryX + 110, summaryY, {
        width: 100,
        align: "right",
      });
    summaryY += 2; // Extra space before final total

    // Final Amount (Total) - Highlighted
    summaryY += 16;
    doc
      .rect(summaryX, summaryY - 5, 220, 25) // Background rectangle for highlight
      .fill(primaryColor)
      .stroke(primaryColor);

    doc
      .fontSize(14)
      .fillColor("#ffffff") // White text
      .font("Helvetica-Bold")
      .text("FINAL AMOUNT:", summaryX + 5, summaryY, {
        width: 130,
        align: "right",
      })
      .text(`₹${order.finalAmount.toFixed(2)}`, summaryX + 140, summaryY, {
        width: 70,
        align: "right",
      });

    // ======================================================
    // FOOTER
    // ======================================================
    doc
      .moveDown(4)
      .fillColor(primaryColor)
      .fontSize(10)
      .text("Payment Status: " + order.paymentStatus.toUpperCase(), {
        // Added payment status
        align: "left",
      })
      .moveDown(0.5)
      .fillColor(secondaryColor)
      .text(
        "Thank you for shopping with us! Please contact support for any queries.",
        {
          align: "center",
        }
      )
      .text("Invoice generated on " + new Date().toLocaleDateString(), {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
