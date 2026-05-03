import * as authService from './auth.service.js';
import path from 'path';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookies.js';
import { validateEmail, validatePassword, validateName } from '@fredoflow/shared';

/**
 * POST /api/v1/auth/register
 */
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    // Validate input
    const emailResult = validateEmail(email);
    if (!emailResult.valid) return res.status(400).json({ success: false, error: emailResult.message, code: 'VALIDATION_ERROR' });

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) return res.status(400).json({ success: false, error: passwordResult.message, code: 'VALIDATION_ERROR' });

    const nameResult = validateName(name);
    if (!nameResult.valid) return res.status(400).json({ success: false, error: nameResult.message, code: 'VALIDATION_ERROR' });

    const result = await authService.register({
      email: emailResult.value,
      password,
      name: nameResult.value,
    });

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(201).json({
      success: true,
      data: { user: result.user },
      message: 'Account created successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate input
    const emailResult = validateEmail(email);
    if (!emailResult.valid) return res.status(400).json({ success: false, error: emailResult.message, code: 'VALIDATION_ERROR' });

    if (!password) return res.status(400).json({ success: false, error: 'Password is required', code: 'VALIDATION_ERROR' });

    const result = await authService.login({
      email: emailResult.value,
      password,
    });

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      data: { user: result.user },
      message: 'Logged in successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/refresh
 */
export async function refresh(req, res, next) {
  try {
    const oldToken = req.cookies?.refresh_token;

    const result = await authService.refreshTokens(oldToken);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      data: { user: result.user },
      message: 'Tokens refreshed successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/logout
 */
export async function logoutHandler(req, res, next) {
  try {
    const refreshToken = req.cookies?.refresh_token;

    await authService.logout(refreshToken);

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/auth/me
 */
export async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/auth/me
 */
export async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required', code: 'VALIDATION_ERROR' });
    }
    const user = await authService.updateProfile(req.user.id, { name: name.trim() });
    res.status(200).json({ success: true, data: { user }, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/me/avatar
 */
export async function updateAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded', code: 'VALIDATION_ERROR' });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await authService.updateAvatar(req.user.id, avatarUrl);
    res.status(200).json({ success: true, data: { user }, message: 'Avatar updated successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/me/password
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new passwords are required', code: 'VALIDATION_ERROR' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'New password must be at least 8 characters', code: 'VALIDATION_ERROR' });
    }
    await authService.changePassword(req.user.id, { currentPassword, newPassword });
    res.status(200).json({ success: true, data: null, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}
