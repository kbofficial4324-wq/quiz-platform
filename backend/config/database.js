import mongoose from "mongoose";
import dns from "node:dns";

// ==========================================
// Use public DNS servers for MongoDB Atlas
// ==========================================

dns.setServers([
  "1.1.1.1",
  "8.8.8.8",
]);

// ==========================================
// Connect MongoDB Atlas
// ==========================================

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");

    console.log(
      "MONGO_URI exists:",
      !!process.env.MONGO_URI
    );

    const conn = await mongoose.connect(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 15000,
      }
    );

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}`
    );

    console.log(
      `📦 Database: ${conn.connection.name}`
    );

  } catch (error) {

    console.error(
      "❌ MongoDB Connection Error:"
    );

    console.error(error.message);

    process.exit(1);
  }
};

export default connectDB;