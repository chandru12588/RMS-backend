import express from "express";
import { 
  createOrder, 
  getOrders, 
  getOrderById,        // 🔥 Added
  updateOrderStatus,
  getStats 
} from "../controllers/orderController.js";

import { generateInvoice } from "../controllers/invoiceController.js";

const router = express.Router();

/* ========================= CUSTOMER ========================= */
// Customer places order → POST /api/orders/create
router.post("/create", createOrder);

/* =========================== ADMIN ========================== */
// Fetch all orders → GET /api/orders
router.get("/", getOrders);

// 🔥 Fetch single order → GET /api/orders/:id
router.get("/:id", getOrderById);   // <-- FIXED 404 ERROR

// Update order status → PUT /api/orders/status/:id
router.put("/status/:id", updateOrderStatus);

/* ====================== INVOICE DOWNLOAD ===================== */
// Invoice PDF download → GET /api/orders/invoice/download/:orderId
router.get("/invoice/download/:orderId", generateInvoice);

/* ======================= DASHBOARD STATS ====================== */
// Order stats → GET /api/orders/stats
router.get("/stats", getStats);

export default router;
