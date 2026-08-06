import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import Discount from "../models/discountModel.js";
import Coupon from "../models/couponModel.js";

async function migrateIndexes() {
  console.log("Connecting to database for index migration...");
  await connectDB();

  try {
    console.log("Syncing indexes for Discount collection...");
    await Discount.syncIndexes();
    console.log("✅ Discount indexes synced successfully.");

    console.log("Syncing indexes for Coupon collection...");
    await Coupon.syncIndexes();
    console.log("✅ Coupon indexes synced successfully.");
  } catch (error) {
    console.error("❌ Index migration failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

migrateIndexes();
