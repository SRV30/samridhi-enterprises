import mongoose from "mongoose";
const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  locationCode: { type: String, unique: true, required: true },
  address: String
}, { timestamps: true });
export default mongoose.model("Warehouse", warehouseSchema);
