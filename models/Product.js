import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

  name: { type: String, required: true },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  price: { type: Number, required: true },

  unit: { type: String, default: "kg" },  // kg, piece, 100g, etc

  // ⭐ Multiple images instead of single
  images: {
    type: [String],     // stores image filenames like ["a.jpg","b.png"]
    default: []
  },

  available: { type: Boolean, default: true },

  description: { type: String, default: "" },

}, { timestamps: true });

// 🔍 Enable fast searching
productSchema.index({ name: "text" });

export default mongoose.model("Product", productSchema);
