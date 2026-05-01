import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate a short-lived access token.
 * @param {{ id: string, email: string }} payload
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

/**
 * Generate a long-lived refresh token.
 * @param {{ id: string, email: string }} payload
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

/**
 * Verify a JWT token.
 * @param {string} token
 * @param {'access' | 'refresh'} type
 * @returns {object} decoded payload
 */
export function verifyToken(token, type) {
  const secret = type === 'access' ? ACCESS_SECRET : REFRESH_SECRET;
  if (!secret) throw new Error(`Missing secret for ${type} token`);
  return jwt.verify(token, secret);
}

/**
 * Parse an expiry string (e.g. "15m", "7d") into milliseconds.
 */
function parseExpiry(expiryStr, defaultMs) {
  const match = expiryStr.match(/^(\d+)([smhd])$/);
  if (!match) return defaultMs;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * (multipliers[unit] || defaultMs);
}

export function getAccessExpiryMs() {
  return parseExpiry(ACCESS_EXPIRY, 15 * 60 * 1000);
}

export function getRefreshExpiryMs() {
  return parseExpiry(REFRESH_EXPIRY, 7 * 24 * 60 * 60 * 1000);
}
