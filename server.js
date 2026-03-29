import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import cloudinary from "./config/cloudinary.js";

import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import Admin from "./models/Admin.js";
import bcrypt from "bcryptjs";

dotenv.config();

//=============== DB + Default Admin =================
async function createDefaultAdmin() {
  try {
    const targetEmail = (process.env.ADMIN_LOGIN_EMAIL || "admin@rms.com").toLowerCase();
    const legacyEmail = "owner@rms.com";
    const admin = await Admin.findOne({ email: targetEmail });

    if (!admin) {
      const legacyAdmin = await Admin.findOne({ email: legacyEmail });

      if (legacyAdmin) {
        legacyAdmin.email = targetEmail;
        await legacyAdmin.save();
        console.log("Legacy admin migrated to admin@rms.com");
        return;
      }

      const passwordHash = await bcrypt.hash("rms@123", 10);
      await Admin.create({
        name: "RMS Owner",
        email: targetEmail,
        mobile: "9655244550",
        passwordHash,
        role: "owner",
      });
      console.log("Default admin created");
    } else {
      console.log("Default admin exists");
    }
  } catch (err) {
    console.log(err);
  }
}

connectDB().then(() => createDefaultAdmin());

const app = express();

//=============== FIXED CORS =================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://rameswaram-seafoods.vercel.app",
      "https://rameswaram-seafoods-kijicj5ia-chandrus-projects-9edfaf7f.vercel.app",
      "https://rms-backend-44od.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));

app.use("/uploads", express.static("uploads"));
app.use("/invoices", express.static("invoices"));

//=============== Routes =================
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.send("RMS Backend Running Successfully"));

//=============== Start Server =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
