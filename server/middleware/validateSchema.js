import ErrorHandler from "../utils/errorHandler.js";

/**
 * Express middleware factory to validate request payloads against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Request property to validate (default: 'body')
 */
export const validateSchema = (schema, source = "body") => {
  return (req, res, next) => {
    if (!schema || typeof schema.safeParse !== "function") {
      return next();
    }

    const result = schema.safeParse(req[source] || {});

    if (!result.success) {
      const formattedErrors = result.error.issues
        ? result.error.issues.map((issue) => `${issue.path.join(".") || "payload"}: ${issue.message}`).join("; ")
        : "Invalid request payload";

      return next(new ErrorHandler(`Validation error: ${formattedErrors}`, 400));
    }

    // Replace req[source] with sanitized/coerced data
    req[source] = result.data;
    next();
  };
};

export default validateSchema;
