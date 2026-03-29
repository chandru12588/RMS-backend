import express from "express";
import {
  registerAdmin,
  loginAdmin,
  changeAdminPassword,
  resetAdminPassword,
  getAdminMe,
} from "../controllers/adminController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/reset-password", resetAdminPassword);
router.get("/me", requireAuth, requireAdmin, getAdminMe);
router.put("/change-password", requireAuth, requireAdmin, changeAdminPassword);

export default router;
