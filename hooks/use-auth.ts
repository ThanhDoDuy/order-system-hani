'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userInfoCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('user_info='));
        
        if (userInfoCookie) {
          const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
          setUser(userInfo);
          setIsAuthenticated(true);
        } else {
          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear state on error
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Only run once on mount

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Clear state before redirect
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
  };
} 