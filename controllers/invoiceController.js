import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Order from "../models/Order.js";

const money = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

export const generateInvoice = async (req, res) => {
  try {
    const orderId = String(req.params.orderId || "").trim();
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send("Order not found");

    const folder = path.resolve("invoices");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    const fileName = `invoice_${orderId}.pdf`;
    const filePath = path.join(folder, fileName);

    const pdf = new PDFDocument({ margin: 40, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    pdf.pipe(stream);

    const fontPath = path.resolve("assets/fonts/NotoSans-Regular.ttf");
    if (fs.existsSync(fontPath)) {
      pdf.font(fontPath);
    }

    const logo = path.resolve("assets/logo.png");
    if (fs.existsSync(logo)) {
      pdf.image(logo, 207, 20, { width: 180 });
    }

    pdf.moveDown(6);
    pdf.fontSize(22).text("Rameswaram Seafoods", { align: "center" });
    pdf.fontSize(12).text("Fresh From Sea To Home", { align: "center" });
    pdf.fontSize(10).text(
      "Plot No.24, SF No.44/2, Opp Sanjeevi Nagar, Pallivasal, TN 620002",
      { align: "center" }
    );
    pdf.text("Phone: 096552 44550", { align: "center" });

    pdf.moveDown(1);
    pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).stroke();

    pdf.moveDown(1.5);
    const infoY = pdf.y;

    pdf
      .fontSize(10)
      .text(`Invoice No : INV-${orderId}`, 40, infoY)
      .text(`Date       : ${new Date(order.createdAt).toLocaleDateString()}`, 40, pdf.y + 2)
      .text(`Payment    : ${order.paymentMode || "COD"}`, 40, pdf.y + 2)
      .text(`Pay Status : ${order.paymentStatus || "Pending"}`, 40, pdf.y + 2);

    const customerX = 330;
    pdf.fontSize(12).text("Customer Details", customerX, infoY, { underline: true });
    pdf
      .fontSize(10)
      .text(`Name    : ${order.customerName}`, customerX, pdf.y + 5)
      .text(`Mobile  : ${order.customerMobile}`, customerX, pdf.y + 2)
      .text(`Email   : ${order.customerEmail || "-"}`, customerX, pdf.y + 2)
      .text(`Address : ${order.customerAddress}`, customerX, pdf.y + 2, { width: 220 });

    pdf.moveDown(4);

    const tableTop = pdf.y;
    const itemX = 55;
    const qtyX = 280;
    const priceX = 380;
    const totalX = 470;
    const tableWidth = 500;
    const rowHeight = 24;
    const startX = 50;

    pdf.rect(startX, tableTop, tableWidth, rowHeight).fillAndStroke("#eeeeee", "#000000");
    pdf.fillColor("#000000").fontSize(11);
    pdf.text("Item", itemX, tableTop + 7);
    pdf.text("Qty", qtyX, tableTop + 7);
    pdf.text("Price", priceX, tableTop + 7);
    pdf.text("Total", totalX, tableTop + 7);

    let currentY = tableTop + rowHeight;
    pdf.fontSize(10);

    order.items.forEach((item) => {
      pdf.rect(startX, currentY, tableWidth, rowHeight).stroke();
      pdf.text(item.name, itemX, currentY + 6);
      pdf.text(String(item.quantity), qtyX, currentY + 6);
      pdf.text(money(item.price), priceX, currentY + 6);
      pdf.text(money(item.total), totalX, currentY + 6);
      currentY += rowHeight;
    });

    const subtotal = order.subtotalAmount ?? order.items.reduce((sum, i) => sum + Number(i.total || 0), 0);
    const cleaningCharge = Number(order.cleaningCharge || 0);
    const deliveryCharge = Number(order.deliveryCharge || 0);
    const total = Number(order.totalAmount || subtotal + cleaningCharge + deliveryCharge);

    const summaryRows = [
      ["Subtotal", money(subtotal)],
      ["Cut & Cleaning Charge", money(cleaningCharge)],
      ["Delivery Charge", money(deliveryCharge)],
      ["Grand Total", money(total)],
    ];

    summaryRows.forEach(([label, amount], idx) => {
      pdf.rect(startX, currentY, tableWidth, rowHeight).stroke();
      const isFinal = idx === summaryRows.length - 1;
      pdf.fontSize(isFinal ? 11 : 10);
      pdf.text(label, itemX, currentY + 6);
      pdf.text(amount, totalX, currentY + 6);
      currentY += rowHeight;
    });

    const footerY = Math.max(currentY + 30, 730);
    pdf
      .fontSize(12)
      .text("Thank you for buying with us", 0, footerY, { align: "center", width: 595 })
      .text("Visit Again", 0, footerY + 15, { align: "center", width: 595 });

    pdf.end();

    stream.on("finish", () => res.download(filePath));
    stream.on("error", () => res.status(500).json({ message: "Invoice file error" }));
  } catch (error) {
    console.error("Invoice Error:", error);
    res.status(500).json({ message: "Invoice Generation Failed", error: error.message });
  }
};
