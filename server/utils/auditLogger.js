import AuditLogCollector from "./auditLogCollector.js";
import auditLogModel from "../models/auditLogModel.js";

/**
 * Standard audit logger for domain action tracking
 */
export const logAudit = async ({
  actorId,
  actorRole,
  action,
  entityType,
  entityId,
  metadata = {},
  changes = null,
}) => {
  try {
    return await auditLogModel.create({
      actorId: actorId || null,
      actorRole: actorRole || "System",
      action,
      entityType: entityType || "General",
      entityId: entityId ? String(entityId) : null,
      changes: AuditLogCollector.sanitizePayload(changes),
      metadata,
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
    return null;
  }
};
