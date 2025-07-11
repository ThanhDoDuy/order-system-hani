// Environment configuration
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  },
} as const

// Validate required environment variables
export function validateConfig() {
  const requiredEnvVars = ['NEXT_PUBLIC_API_BASE_URL']
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Warning: ${envVar} is not set. Using default value: http://localhost:8000/api/v1`)
    }
  }
}

// Call validation in development
if (process.env.NODE_ENV === 'development') {
  validateConfig()
} 