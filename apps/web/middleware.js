import { NextResponse } from 'next/server';

/**
 * Middleware to protect routes and handle auth redirects.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPublicAsset = pathname.startsWith('/_next') || 
                        pathname.startsWith('/api') || 
                        pathname.includes('favicon.ico');

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // 1. If user is NOT logged in and trying to access a protected route
  if (!token && !isAuthPage) {
    const url = new URL('/login', request.url);
    // Optional: add a redirect parameter to return here after login
    // url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 2. If user IS logged in and trying to access login/register
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
