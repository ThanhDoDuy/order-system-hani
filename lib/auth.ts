// Đã xóa import { cookies } from 'next/headers' vì chỉ dùng được trong server component hoặc route handler.
// Nếu cần lấy cookies ở server, hãy chuyển logic này sang file trong app/ hoặc api route.

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
    // const cookieStore = await cookies(); // Xóa dòng này
    const userInfo = null; // Xóa dòng này
    
    if (!userInfo) { // Xóa dòng này
      return null;
    }

    return JSON.parse(userInfo); // Xóa dòng này
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    // const cookieStore = await cookies(); // Xóa dòng này
    const token = null; // Xóa dòng này
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