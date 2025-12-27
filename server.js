import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import cloudinary from "./config/cloudinary.js";

// Routes
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Default Admin Setup
import Admin from "./models/Admin.js";
import bcrypt from "bcryptjs";

dotenv.config();

// ===============================
// Database Connection + Create Default Admin
// ===============================
async function createDefaultAdmin() {
  try {
    const adminExists = await Admin.findOne({ email: "owner@rms.com" });

    if (!adminExists) {
      const passwordHash = await bcrypt.hash("rms@123", 10);

      await Admin.create({
        name: "RMS Owner",
        email: "owner@rms.com",
        mobile: "9655244550",
        passwordHash,
        role: "owner"
      });

      console.log(`
===============================
🟢 Default Admin Created
Email : owner@rms.com
Pass  : rms@123
===============================
`);
    } else {
      console.log("✔ Default admin already exists");
    }
  } catch (error) {
    console.log("❌ Admin create error:", error.message);
  }
}

connectDB().then(() => createDefaultAdmin());

const app = express();

// ===============================
// CORS MIDDLEWARE (FIXED)
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",                    // local development
      "https://rameswaram-seafoods-kijicj5ia-chandrus-projects-9edfaf7f.vercel.app"    // live frontend (NO slash)
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));

// Static Folders
app.use("/uploads", express.static("uploads"));
app.use("/invoices", express.static("invoices"));

// ===============================
// Routes
// ===============================
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 RMS Backend Running Successfully");
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server Running at ${PORT}`));
