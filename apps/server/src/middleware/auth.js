import { verifyToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

/**
 * Auth middleware — extracts access token from cookies,
 * verifies it, and attaches user to req.
 */
export function authenticate(req, _res, next) {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const decoded = verifyToken(token, 'access');
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    // JWT errors (expired, malformed)
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired', 401, 'TOKEN_EXPIRED'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid access token', 401, 'INVALID_TOKEN'));
    }
    next(new AppError('Authentication failed', 401, 'AUTH_FAILED'));
  }
}
