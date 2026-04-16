/**
 * JWT Utility - Decode and extract claims from JWT tokens
 * No external dependency needed - uses native atob()
 */

/**
 * Decode a JWT token payload (without verification - verification is done server-side)
 * @param {string} token - The JWT token string
 * @returns {object|null} The decoded payload or null if invalid
 */
export function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Handle base64url encoding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * @param {string} token - The JWT token string
 * @returns {boolean} True if expired or invalid
 */
export function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds, Date.now() is in milliseconds
  return Date.now() >= payload.exp * 1000;
}

/**
 * Map backend role names to frontend role keys
 * BE roles: ADMIN, MANAGER, SUPPLY_COORDINATOR, CENTRAL_KITCHEN_STAFF, FRANCHISE_STORE_STAFF, SHIPPER
 * FE roles: admin, manager, supply_coordinator, kitchen_staff, store_staff
 */
const ROLE_MAP = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPPLY_COORDINATOR: 'supply_coordinator',
  CENTRAL_KITCHEN_STAFF: 'kitchen_staff',
  FRANCHISE_STORE_STAFF: 'store_staff',
  SHIPPER: 'store_staff', // Map shipper to store_staff for now (no dedicated shipper UI)
};

/**
 * Extract user info from a JWT token
 * @param {string} token - The JWT token string
 * @returns {object|null} User object or null if invalid
 */
export function extractUserFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return null;

  // roles is an array/set in the JWT, take the first one
  const beRoles = payload.roles || [];
  const beRole = Array.isArray(beRoles) ? beRoles[0] : [...beRoles][0];
  const feRole = ROLE_MAP[beRole] || 'store_staff';

  return {
    id: payload.sub, // userId
    name: payload.fullName || 'User',
    email: null, // Not included in JWT claims
    role: feRole,
    beRole: beRole, // Keep original BE role for reference
    avatar: null,
  };
}
