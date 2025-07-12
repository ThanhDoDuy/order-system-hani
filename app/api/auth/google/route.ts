import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI! || 'http://localhost:3000/api/auth/callback/google';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login?error=access_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokenData = await tokenResponse.json();
    const { id_token } = tokenData;

    try {
      // Send id_token to backend
      const backendAuthUrl = `${BACKEND_URL}/api/v1/auth/google`;
      console.log('Calling backend URL:', backendAuthUrl);
      
      const backendResponse = await fetch(backendAuthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: allow cookies to be set
        body: JSON.stringify({ idToken: id_token }),
      });
      
      if (!backendResponse.ok) {
        throw new Error(`Backend authentication failed: ${backendResponse.status}`);
      }

      // Create response that will preserve the cookies set by the backend
      const response = NextResponse.redirect(new URL('/dashboard', request.url));
      
      // Copy cookies from backend response to our response
      const setCookieHeader = backendResponse.headers.get('set-cookie');
      if (setCookieHeader) {
        response.headers.set('set-cookie', setCookieHeader);
      }

      return response;
    } catch (backendError) {
      console.error('Backend connection error:', backendError);
      return NextResponse.redirect(new URL('/login?error=server_error', request.url));
    }
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
} 