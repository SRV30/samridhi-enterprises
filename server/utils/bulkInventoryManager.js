import PartModel from "../models/partModel.js";
import { logAudit } from "./auditLogger.js";

/**
 * Validate batch inventory update requests to ensure stock consistency and atomicity.
 */
export const validateBulkStockUpdate = (updates) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    return { isValid: false, message: "Updates array cannot be empty" };
  }

  for (const item of updates) {
    if (!item.partId) {
      return { isValid: false, message: "Each item must have a valid partId" };
    }
    if (typeof item.stockAdjustment !== "number" && typeof item.newStock !== "number") {
      return { isValid: false, message: "Invalid stock change payload for part: " + item.partId };
    }
  }

  return { isValid: true };
};

/**
 * Process batch inventory update safely within session transaction
 */
export const processBulkStockAdjustment = async (updates, adminUser, session = null) => {
  const validation = validateBulkStockUpdate(updates);
  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const results = [];
  for (const update of updates) {
    const part = await PartModel.findById(update.partId).session(session);
    if (!part) {
      throw new Error(`Part with ID ${update.partId} not found`);
    }

    const previousStock = part.stock;
    if (typeof update.newStock === "number") {
      part.stock = Math.max(0, update.newStock);
    } else if (typeof update.stockAdjustment === "number") {
      part.stock = Math.max(0, part.stock + update.stockAdjustment);
    }

    await part.save({ session });

    results.push({
      partId: part._id,
      name: part.name,
      previousStock,
      currentStock: part.stock
    });

    logAudit({
      actorId: adminUser._id,
      actorRole: adminUser.role,
      action: "BULK_INVENTORY_ADJUSTMENT",
      entityType: "Part",
      entityId: part._id.toString(),
      metadata: { previousStock, currentStock: part.stock, reason: update.reason || "Bulk update" }
    });
  }

  return results;
};
