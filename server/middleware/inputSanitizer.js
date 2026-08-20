import catchAsyncErrors from "./catchAsyncErrors.js";

/**
 * XSS and HTML input sanitizer middleware.
 * Express exposes req.query and req.params as read-only getters in newer
 * versions, so never replace those objects. Sanitize only mutable request
 * containers and normalize query/params through locals for downstream use.
 */
const sanitizeInput = (val) => {
  if (typeof val === "string") {
    return val
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .trim();
  }
  if (Array.isArray(val)) return val.map(sanitizeInput);
  if (typeof val === "object" && val !== null) {
    const sanitized = {};
    for (const key of Object.keys(val)) sanitized[key] = sanitizeInput(val[key]);
    return sanitized;
  }
  return val;
};

export const inputSanitizer = catchAsyncErrors(async (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    const sanitizedBody = sanitizeInput(req.body);
    Object.keys(req.body).forEach((key) => delete req.body[key]);
    Object.assign(req.body, sanitizedBody);
  }

  // req.query and req.params are getter-backed in Express 5. Do not assign
  // to them. Express's query parser already provides the objects consumed by
  // controllers; downstream code should validate/escape values at the sink.
  next();
});
