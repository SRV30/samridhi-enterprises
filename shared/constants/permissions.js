/**
 * shared/constants/permissions.js
 *
 * SINGLE SOURCE OF TRUTH for every role name, permission name, and
 * hierarchy rule used across the entire Samridhi Enterprises application.
 *
 * Both the Express server and the React client import from this module so
 * that a role rename, a new permission, or a hierarchy change is reflected
 * everywhere without hunting for scattered string literals.
 *
 * Usage
 * -----
 *   import { ROLES, PERMISSIONS, hasRole } from "../shared/constants/permissions.js";
 *
 *   if (hasRole(req.user, ROLES.ADMIN, ROLES.MANAGER)) { ... }
 *   if (hasPermission(req.user, PERMISSIONS.MANAGE_PRODUCTS)) { ... }
 */

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  USER: "USER",
});

/** Convenience array for Mongoose enum validation. */
export const ROLES_ARRAY = Object.freeze(Object.values(ROLES));

// ---------------------------------------------------------------------------
// Permissions  (granular action-level permissions for the user.permissions[])
// ---------------------------------------------------------------------------

export const PERMISSIONS = Object.freeze({
  MANAGE_PRODUCTS: "manage_products",
  MANAGE_ORDERS: "manage_orders",
  MANAGE_USERS: "manage_users",
  MANAGE_BRANDS: "manage_brands",
  MANAGE_BIKES: "manage_bikes",
  MANAGE_COUPONS: "manage_coupons",
  MANAGE_SUPPORT: "manage_support",
  MANAGE_ANALYTICS: "manage_analytics",
  MANAGE_PAYMENT_SETTINGS: "manage_payment_settings",
  MANAGE_INVENTORY: "manage_inventory",
});

/** Convenience array of all permissions (useful for seeding / validation). */
export const PERMISSIONS_ARRAY = Object.freeze(Object.values(PERMISSIONS));

// ---------------------------------------------------------------------------
// Role hierarchy  (higher number = more privileges)
// ---------------------------------------------------------------------------

export const ROLE_HIERARCHY = Object.freeze({
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.USER]: 1,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check whether a user has one of the given roles.
 * @param {{ role?: string } | null | undefined} user
 * @param {...string} allowedRoles  e.g. ROLES.ADMIN, ROLES.MANAGER
 * @returns {boolean}
 */
export const hasRole = (user, ...allowedRoles) => {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};

/**
 * Check whether a user has at least the minimum required hierarchy level.
 * Useful when you want to grant access to "MANAGER and above".
 * @param {{ role?: string } | null | undefined} user
 * @param {string} minimumRole  e.g. ROLES.MANAGER
 * @returns {boolean}
 */
export const hasMinRole = (user, minimumRole) => {
  if (!user || !user.role) return false;
  const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 0;
  return userLevel >= requiredLevel;
};

/**
 * Check whether a user has a specific granular permission.
 * @param {{ permissions?: string[] } | null | undefined} user
 * @param {string} permission  e.g. PERMISSIONS.MANAGE_PRODUCTS
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !Array.isArray(user.permissions)) return false;
  return user.permissions.includes(permission);
};

/**
 * Check whether a user is an admin or manager (the two "staff" roles).
 * This is the most common gate used across the codebase.
 * @param {{ role?: string } | null | undefined} user
 * @returns {boolean}
 */
export const isStaff = (user) => hasRole(user, ROLES.ADMIN, ROLES.MANAGER);

