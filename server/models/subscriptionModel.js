import mongoose from "mongoose";
const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  part: { type: mongoose.Schema.Types.ObjectId, ref: "Part", required: true },
  frequency: { type: String, enum: ["weekly", "monthly", "bi-monthly"], required: true },
  nextOrderDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model("Subscription", subscriptionSchema);
