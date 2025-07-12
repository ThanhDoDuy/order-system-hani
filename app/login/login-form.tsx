'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Chrome } from 'lucide-react';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'access_denied':
          setError('Access denied. Please try again.');
          break;
        case 'no_code':
          setError('Authentication failed. Please try again.');
          break;
        case 'auth_failed':
          setError('Authentication failed. Please try again.');
          break;
        case 'server_error':
          setError('Server error. Please try again later.');
          break;
        default:
          setError('An error occurred. Please try again.');
      }
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/google-url');
      if (!res.ok) {
        throw new Error('Server error');
      }
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      setError('Server error. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <CardContent className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full"
        variant="outline"
      >
        <Chrome className="mr-2 h-4 w-4" />
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </Button>
      
      <div className="text-center text-sm text-gray-500">
        By signing in, you agree to our terms of service and privacy policy.
      </div>
    </CardContent>
  );
} 