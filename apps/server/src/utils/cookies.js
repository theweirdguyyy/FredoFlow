import { getAccessExpiryMs, getRefreshExpiryMs } from './jwt.js';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export function setAuthCookies(res, accessToken, refreshToken) {
  const cookieOptions = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
    path: '/',
  };

  res.cookie('access_token', accessToken, {
    ...cookieOptions,
    maxAge: getAccessExpiryMs(),
  });

  res.cookie('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: getRefreshExpiryMs(),
  });
}

export function clearAuthCookies(res) {
  const cookieOptions = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
    path: '/',
  };

  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', cookieOptions);
}