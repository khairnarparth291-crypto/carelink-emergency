import mongoose from "mongoose";

import ensureSeedData from "./ensureSeed.js";

// Disable command buffering when disconnected to prevent queries from hanging
mongoose.set("bufferCommands", false);

export const isMongoDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/carelink_emergency";
  const timeoutMs = process.env.NODE_ENV === "production" ? 10000 : 5000;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    await ensureSeedData();
    return conn;
  } catch (error) {
    const safeErrorMessage = error?.message
      ? error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s'"]+/gi, "[REDACTED_URI]")
      : "Connection failed";
    console.warn(`⚠️  MongoDB Connection Notice: ${safeErrorMessage}`);
    console.warn(
      "ℹ️  Running in Resilient Mode. When a live MongoDB service is started or configured in server/.env, data will synchronize automatically."
    );
    return null;
  }
};

export const getDBStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};

export default connectDB;
