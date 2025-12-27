import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "rmsDB"   // 👈 force DB selection here
    });
    console.log("🟢 MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Error ->", error.message);
    process.exit(1);
  }
};

export default connectDB;
