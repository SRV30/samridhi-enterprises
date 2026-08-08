import AuditLogCollector from "../utils/auditLogCollector.js";

/**
 * Middleware to intercept administrative or mutating actions and record audit logs.
 */
export const auditLoggerMiddleware = (resourceName, actionType) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
      // Capture after response sent if successful (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user ? req.user._id : null;
        const targetId = req.params.id || req.body.id || data?.data?._id || null;
        const ipAddress = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";
        const userAgent = req.headers["user-agent"] || "unknown";

        AuditLogCollector.logEvent({
          userId,
          action: actionType || `${req.method}_${resourceName.toUpperCase()}`,
          targetResource: resourceName,
          targetId,
          ipAddress,
          userAgent,
          changes: req.method !== "GET" ? req.body : null,
          metadata: {
            statusCode: res.statusCode,
            path: req.originalUrl
          }
        }).catch((err) => console.error("Audit log error:", err));
      }

      return originalJson.call(this, data);
    };

    next();
  };
};
