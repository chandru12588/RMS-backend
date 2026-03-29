import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerMobile: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    customerAddress: {
      type: String,
      required: true,
    },

    // 🛒 Order items array
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        total: { type: Number, required: true }, // Optional but good for invoice
      },
    ],

    subtotalAmount: {
      type: Number,
      required: true,
    },

    cleaningCharge: {
      type: Number,
      default: 20,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Packed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    paymentMode: {
      type: String,
      enum: ["COD", "Online-UPI", "Online-Paid"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending",
    },

    invoiceUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }         // 🔥 Auto adds createdAt + updatedAt
);

// Faster performance for admin dashboard
orderSchema.index({ createdAt: -1 }); 
orderSchema.index({ status: 1 });
orderSchema.index({ customerMobile: 1 });

export default mongoose.model("Order", orderSchema);
