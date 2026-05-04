import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('favicon.ico');

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // Read the cookie — it exists on the backend domain
  // so we check both possible cookie names
  const token =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('accessToken')?.value;

  // If no token and trying to access protected route → login
  if (!token && !isAuthPage) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // If has token and on auth page → go to workspaces
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/workspaces', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};