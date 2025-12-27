import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  passwordHash: String,
  role: { type: String, default: "owner" },
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema);
