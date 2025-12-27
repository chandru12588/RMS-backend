import express from "express";
import upload from "../middleware/upload.js";   // Multer for multi-image uploads

import {
  addProduct,
  getProducts,
  getProductById,      // <-- Added import
  updateProduct,
  toggleAvailability,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

/* ==========================================================
   📦 PRODUCT ROUTES (Cloudinary + Multi-Image Ready)
========================================================== */

// ⭐ Create Product — Multiple Images Upload
router.post("/add", upload.array("images", 5), addProduct);

// ⭐ Fetch All Products
router.get("/", getProducts);

// ⭐ Fetch Single Product by ID  <-- NEW IMPORTANT ROUTE
router.get("/:id", getProductById);

// ⭐ Update Product — Add new images also
router.put("/update/:id", upload.array("images", 5), updateProduct);

// ⭐ Toggle Product Availability
router.put("/toggle/:id", toggleAvailability);

// ⭐ Delete Entire Product
router.delete("/delete/:id", deleteProduct);

export default router;
