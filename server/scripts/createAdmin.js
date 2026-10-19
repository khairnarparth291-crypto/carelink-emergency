/**
 * CareLink Emergency - Administrator Provisioning CLI Script
 *
 * Usage:
 *   node scripts/createAdmin.js --password <password> [--email <email>] [--name <name>]
 *
 * Or set environment variables:
 *   ADMIN_PASSWORD (required), ADMIN_EMAIL, ADMIN_NAME
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--email" && args[i + 1]) {
      options.email = args[++i];
    } else if (args[i] === "--password" && args[i + 1]) {
      options.password = args[++i];
    } else if (args[i] === "--name" && args[i + 1]) {
      options.name = args[++i];
    }
  }
  return options;
}

async function createAdmin() {
  const options = parseArgs();
  const email = (options.email || process.env.ADMIN_EMAIL || "admin@carelink.org").toLowerCase().trim();
  const password = options.password || process.env.ADMIN_PASSWORD;
  const name = options.name || process.env.ADMIN_NAME || "System Administrator";

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    console.error("❌ Invalid email address provided.");
    process.exit(1);
  }

  if (!password) {
    console.error("❌ Administrator password is required.");
    console.error("Please supply a password via the ADMIN_PASSWORD environment variable or the --password option.");
    console.error("Example: node scripts/createAdmin.js --password <your_secure_password>");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("❌ Password must be at least 6 characters long.");
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/carelink_emergency";

  try {
    console.log("Connecting to database...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    let user = await User.findOne({ email });

    if (user) {
      user.name = name;
      user.role = "admin";
      user.password = password; // Will be hashed by pre-save hook
      await user.save();
      console.log("==================================================");
      console.log("✅ Existing account upgraded/updated to Administrator");
      console.log(`👤 Name:  ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Role:  ${user.role}`);
      console.log(`🆔 ID:    ${user._id}`);
      console.log("==================================================");
    } else {
      user = await User.create({
        name,
        email,
        password,
        role: "admin"
      });
      console.log("==================================================");
      console.log("✅ New Administrator successfully provisioned");
      console.log(`👤 Name:  ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Role:  ${user.role}`);
      console.log(`🆔 ID:    ${user._id}`);
      console.log("==================================================");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    const safeError = err?.message
      ? err.message.replace(/mongodb(?:\+srv)?:\/\/[^\s'"]+/gi, "[REDACTED_URI]")
      : "Unknown error";
    console.error("❌ Failed to provision administrator:", safeError);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
}

createAdmin();
