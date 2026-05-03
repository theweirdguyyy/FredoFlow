/**
 * Shared validation utilities for FredoFlow.
 * Used by both frontend and backend for consistent validation.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return { valid: false, message: 'Email is required' };
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, message: 'Invalid email format' };
  return { valid: true, value: trimmed };
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return { valid: false, message: 'Password is required' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (password.length > 128) return { valid: false, message: 'Password must be at most 128 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  return { valid: true };
}

export function validateRequired(value, fieldName) {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, value: typeof value === 'string' ? value.trim() : value };
}

export function validateName(name) {
  const req = validateRequired(name, 'Name');
  if (!req.valid) return req;
  if (req.value.length < 2) return { valid: false, message: 'Name must be at least 2 characters' };
  if (req.value.length > 100) return { valid: false, message: 'Name must be at most 100 characters' };
  return { valid: true, value: req.value };
}
