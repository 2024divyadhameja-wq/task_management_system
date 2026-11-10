const mongoose = require("mongoose");

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskflow";
    if (!process.env.MONGODB_URI) {
      console.warn("⚠️ MONGODB_URI is not defined in .env. Attempting local connection at mongodb://127.0.0.1:27017/taskflow");
    }

    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

module.exports = connectDB;

