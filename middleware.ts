import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth/google', '/api/auth/google-url', '/api/auth/logout'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const authToken = request.cookies.get('auth_token');
  const isAuthenticated = !!authToken?.value;
  
  // If accessing login while authenticated
  if (isAuthenticated && pathname === '/login') {
    // Verify token format before redirecting
    try {
      const token = authToken.value;
      if (token && token.split('.').length === 3) { // Basic JWT format check
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (e) {
      // Invalid token format, let them stay on login
      return NextResponse.next();
    }
  }
  
  // If accessing protected route without authentication
  if (!isAuthenticated && !isPublicRoute && pathname !== '/') {
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