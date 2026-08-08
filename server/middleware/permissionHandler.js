import ErrorHandler from "../utils/errorHandler.js";
import { PERMISSIONS, hasPermission } from "../../shared/constants/permissions.js";

export { PERMISSIONS };

/**
 * Middleware factory that checks whether the authenticated user has a
 * specific granular permission before allowing the request to proceed.
 *
 * @param {string} requiredPermission - One of PERMISSIONS.* constants
 * @returns {Function} Express middleware
 */
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!hasPermission(req.user, requiredPermission)) {
      return next(new ErrorHandler(`Access denied. Missing permission: ${requiredPermission}`, 403));
    }
    next();
  };
};
