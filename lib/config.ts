// Environment configuration
const getApiBaseUrl = () => {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.warn('NEXT_PUBLIC_API_BASE_URL is not set');
    // Default to localhost in development, but throw error in production
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXT_PUBLIC_API_BASE_URL must be set in production');
    }
    return 'http://localhost:8000/api/v1';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL;
};

export const config = {
  api: {
    baseUrl: getApiBaseUrl(),
  },
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Validate required environment variables
export function validateConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_BASE_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];
  
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  if (missingVars.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('Using default values - this is OK for development but not for production');
  }
} 