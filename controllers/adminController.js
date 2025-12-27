import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: "Admin already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await Admin.create({ name, email, mobile, passwordHash });

    res.status(201).json({ message: "Admin Registered", admin });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, admin });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
};
