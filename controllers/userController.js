import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

const signUserToken = (userId) =>
  jwt.sign({ id: userId, role: "user", type: "user" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

export const signupUser = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    const normalizedEmail = (email || "").toLowerCase().trim();
    const adminLoginEmail = (process.env.ADMIN_LOGIN_EMAIL || "admin@rms.com").toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (normalizedEmail === adminLoginEmail) {
      return res.status(400).json({ message: "This email is reserved for admin login" });
    }

    const adminExists = await Admin.findOne({ email: normalizedEmail });
    if (adminExists) {
      return res.status(400).json({ message: "This email is reserved for admin login" });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile?.trim() || "",
      passwordHash,
    });

    const token = signUserToken(user._id);
    return res.status(201).json({
      message: "Signup successful",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed", error });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    user.lastLoginAt = new Date();
    await user.save();

    const token = signUserToken(user._id);
    return res.json({
      message: "Login successful",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { email, mobile, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.mobile && mobile && user.mobile !== mobile) {
      return res.status(400).json({ message: "Mobile number does not match" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ message: "Password reset failed", error });
  }
};

export const getUserMe = async (req, res) => {
  try {
    const user = await User.findById(req.auth?.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(toPublicUser(user));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user profile", error });
  }
};

export const getUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users.map(toPublicUser));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users", error });
  }
};
