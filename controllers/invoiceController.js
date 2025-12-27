import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Order from "../models/Order.js";

export const generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId.trim();
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send("Order not found");

    // Invoice folder setup
    const folder = path.resolve("invoices");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    const fileName = `invoice_${orderId}.pdf`;
    const filePath = path.join(folder, fileName);

    const pdf = new PDFDocument({ margin: 40, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    pdf.pipe(stream);

    /* Load Font (Essential for ₹ Support) */
    const fontPath = path.resolve("assets/fonts/NotoSans-Regular.ttf");
    if (fs.existsSync(fontPath)) {
      pdf.font(fontPath);
    } else {
      console.warn("Font file not found, currency symbols may not render.");
    }

    /* ---------------- Header & Logo ---------------- */
    const logo = path.resolve("assets/logo.png");
    if (fs.existsSync(logo)) {
      // Centering logo: (Page width 595 - logo width 180) / 2 = 207
      pdf.image(logo, 207, 20, { width: 180 });
    }

    pdf.moveDown(6);
    pdf.fontSize(22).text("Rameswaram Seafoods", { align: "center" });
    pdf.fontSize(12).text("Fresh From Sea To Home", { align: "center" });
    pdf.fontSize(10).text("Plot No.24, SF No.44/2, Opp Sanjeevi Nagar, Pallivasal, TN 620002", { align: "center" });
    pdf.text("Phone: 096552 44550", { align: "center" });

    pdf.moveDown(1);
    pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).stroke(); // Horizontal Line

    /* ---------------- Info Section (Two Columns) ---------------- */
    pdf.moveDown(1.5);
    const infoY = pdf.y;
    
    // Left Column: Invoice Details
    pdf.fontSize(10)
      .text(`Invoice No : INV-${orderId}`, 40, infoY)
      .text(`Date          : ${new Date(order.createdAt).toLocaleDateString()}`, 40, pdf.y + 2)
      .text(`Payment     : ${order.paymentMode || "COD"}`, 40, pdf.y + 2);

    // Right Column: Customer Details
    const customerX = 350;
    pdf.fontSize(12).text("Customer Details", customerX, infoY, { underline: true });
    pdf.fontSize(10)
      .text(`Name    : ${order.customerName}`, customerX, pdf.y + 5)
      .text(`Mobile   : ${order.customerMobile}`, customerX, pdf.y + 2)
      .text(`Address : ${order.customerAddress}`, customerX, pdf.y + 2);

    /* ---------------- Table Layout ---------------- */
    pdf.moveDown(4);
    
    // Define Table Constants
    const tableTop = pdf.y;
    const itemX = 55;   
    const qtyX = 300;  
    const priceX = 390; 
    const totalX = 475; 
    const tableWidth = 500;
    const rowHeight = 25;
    const startX = 50;

    // 1. Table Header
    pdf.rect(startX, tableTop, tableWidth, rowHeight).fillAndStroke("#eeeeee", "#000000");
    pdf.fillColor("#000000").fontSize(11);
    pdf.text("Item", itemX, tableTop + 7);
    pdf.text("Qty", qtyX, tableTop + 7);
    pdf.text("Price", priceX, tableTop + 7);
    pdf.text("Total", totalX, tableTop + 7);

    // 2. Table Rows (Items)
    let currentY = tableTop + rowHeight;
    pdf.fontSize(10);

    order.items.forEach((item) => {
      pdf.rect(startX, currentY, tableWidth, rowHeight).stroke();
      pdf.text(item.name, itemX, currentY + 7);
      pdf.text(item.quantity.toString(), qtyX, currentY + 7);
      pdf.text(`₹${item.price.toFixed(2)}`, priceX, currentY + 7);
      pdf.text(`₹${item.total.toFixed(2)}`, totalX, currentY + 7);
      currentY += rowHeight;
    });

    // 3. Grand Total Row
    pdf.rect(startX, currentY, tableWidth, rowHeight).stroke();
    
    // Force font again to ensure ₹ renders in this row
    if (fs.existsSync(fontPath)) pdf.font(fontPath);
    
    pdf.fontSize(11).text("Grand Total:", itemX, currentY + 7);
    pdf.text(`₹${order.totalAmount.toFixed(2)}`, totalX, currentY + 7);

    /* ---------------- Footer ---------------- */
    // Positioned at a fixed distance from the bottom
    const footerY = 750; 
    pdf.fontSize(12).text("Thank You for Buying with Us ❤️", 0, footerY, { align: "center", width: 595 });
    pdf.text("Visit Again!", 0, footerY + 15, { align: "center", width: 595 });

    pdf.end();

    stream.on("finish", () => res.download(filePath));
    
  } catch (error) {
    console.error("Invoice Error:", error);
    res.status(500).json({ message: "Invoice Generation Failed", error: error.message });
  }
};