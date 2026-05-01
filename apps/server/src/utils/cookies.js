/**
 * Cookie utilities for setting/clearing JWT httpOnly cookies.
 */

import { getAccessExpiryMs, getRefreshExpiryMs } from './jwt.js';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'strict',
  path: '/',
};

/**
 * Set access and refresh token cookies on the response.
 */
export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: getAccessExpiryMs(),
  });

  res.cookie('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: getRefreshExpiryMs(),
  });
}

/**
 * Clear both token cookies.
 */
export function clearAuthCookies(res) {
  res.clearCookie('access_token', COOKIE_OPTIONS);
  res.clearCookie('refresh_token', COOKIE_OPTIONS);
}
