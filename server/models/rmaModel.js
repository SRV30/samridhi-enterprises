import mongoose from "mongoose";
const rmaSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["Requested", "Approved", "Refunded", "Rejected"], default: "Requested" },
  items: Array
}, { timestamps: true });
export default mongoose.model("RMA", rmaSchema);
