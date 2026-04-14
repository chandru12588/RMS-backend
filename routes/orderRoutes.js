import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getStats,
} from "../controllers/orderController.js";
import { generateInvoice } from "../controllers/invoiceController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer
router.post("/create", createOrder);
router.get("/invoice/download/:orderId", generateInvoice);

// Admin
router.get("/stats", requireAuth, requireAdmin, getStats);
router.get("/", requireAuth, requireAdmin, getOrders);
router.get("/:id", requireAuth, requireAdmin, getOrderById);
router.put("/status/:id", requireAuth, requireAdmin, updateOrderStatus);
router.delete("/:id", requireAuth, requireAdmin, deleteOrder);

export default router;
