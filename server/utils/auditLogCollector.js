import auditLogModel from "../models/auditLogModel.js";

/**
 * Enhanced Audit Event Collector & Sanitizer
 * Captures critical administrative, security, and financial operations.
 */
class AuditLogCollector {
  /**
   * Redact sensitive tokens and passwords from request body before logging
   */
  static sanitizePayload(payload) {
    if (!payload || typeof payload !== "object") return payload;
    const sanitized = Array.isArray(payload) ? [...payload] : { ...payload };
    
    const sensitiveKeys = ["password", "oldPassword", "newPassword", "token", "otp", "secret", "creditCard"];
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
        sanitized[key] = AuditLogCollector.sanitizePayload(sanitized[key]);
      }
    }
    return sanitized;
  }

  /**
   * Log administrative or sensitive action asynchronously
   */
  static async logEvent({ userId, action, targetResource, targetId, ipAddress, userAgent, changes = null, metadata = {} }) {
    try {
      await auditLogModel.create({
        userId: userId || null,
        action,
        targetResource,
        targetId: targetId || null,
        ipAddress: ipAddress || "0.0.0.0",
        userAgent: userAgent || "Unknown",
        changes: AuditLogCollector.sanitizePayload(changes),
        metadata,
        timestamp: new Date()
      });
    } catch (err) {
      console.error("Failed to write security audit log entry:", err.message);
    }
  }
}

export default AuditLogCollector;
