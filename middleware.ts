import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/api/auth/google',
    '/api/auth/google-url',
    '/api/auth/logout',
    '/api/auth/callback',
    '/_next',
    '/favicon.ico',
  ];
  
  // Skip middleware for public routes and static files
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if user is authenticated by checking the auth cookie from backend
  const authCookie = request.cookies.get('auth_token') || request.cookies.get('connect.sid'); // Check for both JWT and session cookies
  const isAuthenticated = !!authCookie?.value;
  
  // If accessing login while authenticated
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/products',
    '/orders',
    '/cms',
    '/api/v1'
  ];
  
  // If accessing protected route without authentication
  if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  // If accessing root while authenticated
  if (isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 