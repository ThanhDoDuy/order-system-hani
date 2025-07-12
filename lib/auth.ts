import { cookies } from 'next/headers';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: string;
}

export function getGoogleOAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userInfo = cookieStore.get('user_info')?.value;
    
    if (!userInfo) {
      return null;
    }

    return JSON.parse(userInfo);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    return token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
} 