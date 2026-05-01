import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getRefreshExpiryMs,
} from '../../utils/jwt.js';
import { AppError } from '../../middleware/errorHandler.js';

const SALT_ROUNDS = 12;

/**
 * Register a new user.
 * @param {{ email: string, password: string, name: string }} data
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
export async function register({ email, password, name }) {
  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
  });

  // Generate tokens
  const tokenPayload = { id: user.id, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + getRefreshExpiryMs()),
    },
  });

  return { user, accessToken, refreshToken };
}

/**
 * Log in an existing user.
 * @param {{ email: string, password: string }} data
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
export async function login({ email, password }) {
  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const tokenPayload = { id: user.id, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + getRefreshExpiryMs()),
    },
  });

  // Return user without passwordHash
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

/**
 * Rotate refresh tokens — verify old, issue new pair, delete old.
 * @param {string} oldToken
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
export async function refreshTokens(oldToken) {
  if (!oldToken) {
    throw new AppError('Refresh token is required', 401, 'NO_REFRESH_TOKEN');
  }

  // Verify the JWT signature
  let decoded;
  try {
    decoded = verifyToken(oldToken, 'refresh');
  } catch {
    // If token is expired or invalid, clean it from DB
    await prisma.refreshToken.deleteMany({ where: { token: oldToken } });
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  // Check the token exists in DB (prevents reuse after rotation)
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  });

  if (!storedToken) {
    // Possible token reuse attack — revoke all tokens for this user
    await prisma.refreshToken.deleteMany({ where: { userId: decoded.id } });
    throw new AppError('Refresh token has been revoked', 401, 'TOKEN_REVOKED');
  }

  // Delete old token
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  // Fetch user to ensure they still exist
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Generate new token pair
  const tokenPayload = { id: user.id, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store new refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + getRefreshExpiryMs()),
    },
  });

  return { user, accessToken, refreshToken };
}

/**
 * Log out — delete the refresh token from DB.
 * @param {string} token
 */
export async function logout(token) {
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
}

/**
 * Get current user profile.
 * @param {string} userId
 * @returns {object} user profile
 */
export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
}
