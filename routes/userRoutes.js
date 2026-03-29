import express from "express";
import {
  signupUser,
  loginUser,
  resetUserPassword,
  getUserMe,
  getUsersForAdmin,
} from "../controllers/userController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/reset-password", resetUserPassword);
router.get("/me", requireAuth, getUserMe);
router.get("/", requireAuth, requireAdmin, getUsersForAdmin);

export default router;

