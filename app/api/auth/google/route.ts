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
        body: JSON.stringify({ idToken: id_token }),
      });
      console.log('backendResponse status:', backendResponse.status);
      console.log('backendResponse ok:', backendResponse.ok);
      
      const responseText = await backendResponse.text();
      console.log('Raw response text:', responseText);
      
      if (!backendResponse.ok) {
        console.error('Backend auth failed:', responseText);
        throw new Error(`Backend authentication failed: ${backendResponse.status}`);
      }

      let authData;
      try {
        authData = JSON.parse(responseText);
        console.log('Parsed authData:', authData);
      } catch (parseError) {
        console.error('Failed to parse auth response:', parseError);
        throw new Error('Invalid response format from backend');
      }
      
      if (!authData.access_token) {
        console.error('Missing access_token in response');
        throw new Error('Invalid authentication response: missing access_token');
      }
      
      const { access_token, user } = authData;

      // Create response with cookies
      const response = NextResponse.redirect(new URL('/dashboard', request.url));
      
      // Set JWT token in httpOnly cookie
      response.cookies.set('auth_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      // Set user info in session cookie
      response.cookies.set('user_info', JSON.stringify(user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

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