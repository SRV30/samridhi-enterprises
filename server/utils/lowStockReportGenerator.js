import Part from "../models/partModel.js";
export const generateLowStockReport = async () => {
  const lowStockParts = await Part.find({ $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] } });
  return lowStockParts.map(p => ({ id: p._id, name: p.name, stock: p.stock, threshold: p.lowStockThreshold || 5 }));
};
