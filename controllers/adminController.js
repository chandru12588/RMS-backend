import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ADMIN_LOGIN_EMAIL = (process.env.ADMIN_LOGIN_EMAIL || "admin@rms.com").toLowerCase();

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: "Admin already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await Admin.create({ name, email, mobile, passwordHash });

    res.status(201).json({
      message: "Admin Registered",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || "").toLowerCase().trim();

    if (normalizedEmail !== ADMIN_LOGIN_EMAIL) {
      return res.status(403).json({ message: "Only admin@rms.com can access admin login" });
    }

    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin", type: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const admin = await Admin.findById(req.auth?.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) return res.status(400).json({ message: "Current password is incorrect" });

    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to change password", error });
  }
};

export const resetAdminPassword = async (req, res) => {
  try {
    const { email, mobile, newPassword } = req.body;
    const normalizedEmail = (email || "").toLowerCase().trim();
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (normalizedEmail !== ADMIN_LOGIN_EMAIL) {
      return res.status(403).json({ message: "Only admin@rms.com can reset admin password" });
    }

    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (admin.mobile && mobile && admin.mobile !== mobile) {
      return res.status(400).json({ message: "Mobile number does not match" });
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return res.json({ message: "Admin password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reset password", error });
  }
};

export const getAdminMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.auth?.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    return res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      role: admin.role,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admin profile", error });
  }
};
