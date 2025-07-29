import Snack from "../models/Snack.js";
import QRCode from "qrcode";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import Order from "../models/Order.js";

export const getSnackList = async (req, res, next) => {
  try {
    const snacks = await Snack.find({});
    return res.status(200).json({ snacks });
  } catch (error) {
    console.error("Error fetching snacks:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const orderSnacks = async (req, res, next) => {
  try {
    const { userId, cartItems, cartTotal } = req.body;

    if (
      !userId ||
      !cartItems ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0 ||
      !cartTotal
    ) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid order details" });
    }

    const newOrder = await Order.create({
      userId,
      items: cartItems,
      totalAmount: cartTotal,
      createdAt: new Date(),
    });

    return res.status(201).json({
      status: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Order placement failed:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const existOrders = await Order.find({}).lean();

    const totalAmount = existOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalOrders = existOrders.length;

    return res.status(200).json({
      status: true,
      totalOrders,
      totalAmount,
      orders: existOrders,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong while fetching orders.",
      error: error.message,
    });
  }
};

export const generateInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Generate QR code image
    const qrDataURL = await QRCode.toDataURL(orderId);
    const base64Image = qrDataURL.split(",")[1];
    const qrImageBuffer = Buffer.from(base64Image, "base64");

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    // Fonts
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Colors
    const primaryColor = rgb(0.0, 0.4, 0.1);
    // bluish
    const textColor = rgb(0.2, 0.2, 0.2);
    const gray = rgb(0.5, 0.5, 0.5);

    // Draw header banner
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width,
      height: 100,
      color: primaryColor,
    });

    // Header text
    page.drawText("FoodX - Order Invoice", {
      x: 40,
      y: height - 60,
      size: 24,
      font: titleFont,
      color: rgb(1, 1, 1),
    });

    // Order confirmation text
    page.drawText("Order Placed Successfully!", {
      x: width / 2 - 120,
      y: height - 150,
      size: 18,
      font: titleFont,
      color: primaryColor,
    });

    // Order ID
    page.drawText(`Order ID: ${orderId}`, {
      x: width / 2 - 120,
      y: height - 180,
      size: 14,
      font: regularFont,
      color: textColor,
    });

    // QR Code Image
    const qrImage = await pdfDoc.embedPng(qrImageBuffer);
    const scaleFactor = 2.8;
    const qrDims = qrImage.scale(scaleFactor);

    page.drawImage(qrImage, {
      x: width / 2 - qrDims.width / 2,
      y: height / 2 - qrDims.height / 2,
      width: qrDims.width,
      height: qrDims.height,
    });

    // Scan instructions
    page.drawText("Scan the QR code to track your order", {
      x: width / 2 - 100,
      y: height / 2 - qrDims.height / 2 - 30,
      size: 12,
      font: regularFont,
      color: gray,
    });

    // Footer
    page.drawText("Thank you for ordering with FoodX!", {
      x: width / 2 - 120,
      y: 60,
      size: 14,
      font: titleFont,
      color: primaryColor,
    });

    // Send PDF
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${orderId}.pdf`
    );
    res.send(pdfBytes);
  } catch (err) {
    next(err);
  }
};
