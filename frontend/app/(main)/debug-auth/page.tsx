'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useEffect, useState, useMemo } from 'react';

interface DecodedToken {
  id: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export default function DebugAuth() {
  const { user, isAuthenticated, token } = useAuthStore();
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0); // Initialize with 0

  // Update current time periodically
  useEffect(() => {
    // Set initial time inside effect
    setCurrentTime(Date.now());
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('token');
    setLocalStorageToken(storedToken);

    // Decode token if it exists
    if (storedToken) {
      try {
        const parts = storedToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1])) as DecodedToken;
          setDecodedToken(payload);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setDecodedToken(null);
      }
    } else {
      setDecodedToken(null);
    }
  }, []);

  // Calculate token validity using memoized value
  const tokenExpiry = useMemo(() => {
    if (!decodedToken?.exp || currentTime === 0) return null;
    
    const expiryDate = new Date(decodedToken.exp * 1000);
    const isValid = decodedToken.exp * 1000 > currentTime;
    
    return {
      date: expiryDate,
      isValid,
      timeLeft: isValid ? decodedToken.exp * 1000 - currentTime : 0,
    };
  }, [decodedToken, currentTime]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Auth Debug Info</h1>
      
      <div className="space-y-6">
        {/* Auth Store State */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Auth Store State</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(
              { 
                user, 
                isAuthenticated, 
                hasToken: !!token 
              }, 
              null, 
              2
            )}
          </pre>
        </div>

        {/* LocalStorage Token */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">LocalStorage Token</h2>
          {localStorageToken ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-2">Token Preview:</p>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs break-all">
                {localStorageToken.substring(0, 100)}...
              </pre>
              <p className="text-sm text-gray-500 mt-2">
                Token length: {localStorageToken.length} characters
              </p>
            </div>
          ) : (
            <p className="text-red-600">No token found in localStorage</p>
          )}
        </div>

        {/* Decoded Token */}
        {decodedToken && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Decoded Token Payload</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(decodedToken, null, 2)}
            </pre>
            {tokenExpiry && (
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>Token expires: {tokenExpiry.date.toLocaleString()}</p>
                <p>
                  Status: {' '}
                  <span className={tokenExpiry.isValid ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {tokenExpiry.isValid ? 'Valid' : 'Expired'}
                  </span>
                </p>
                {tokenExpiry.isValid && tokenExpiry.timeLeft > 0 && (
                  <p>
                    Time left: {' '}
                    <span className="font-mono">
                      {Math.floor(tokenExpiry.timeLeft / (1000 * 60 * 60))}h{' '}
                      {Math.floor((tokenExpiry.timeLeft % (1000 * 60 * 60)) / (1000 * 60))}m{' '}
                      {Math.floor((tokenExpiry.timeLeft % (1000 * 60)) / 1000)}s
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Role Check */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Role Check</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">User Role:</span>
              <code className="bg-gray-100 px-3 py-1 rounded font-mono">
                {user?.role || 'None'}
              </code>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Is Admin (ADMIN):</span>
              <code className={`px-3 py-1 rounded font-mono ${
                user?.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {String(user?.role === 'ADMIN')}
              </code>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Is Admin (admin):</span>
              <code className={`px-3 py-1 rounded font-mono ${
                user?.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {String(user?.role === 'ADMIN')}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Is User (USER):</span>
              <code className={`px-3 py-1 rounded font-mono ${
                user?.role === 'USER' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {String(user?.role === 'USER')}
              </code>
            </div>
          </div>
        </div>

        {/* Auth Status Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Auth Status Summary</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${user ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{user ? 'User data loaded' : 'No user data'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${localStorageToken ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{localStorageToken ? 'Token in localStorage' : 'No token in localStorage'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${decodedToken ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{decodedToken ? 'Token decoded successfully' : 'Token not decoded'}</span>
            </div>
            {tokenExpiry && currentTime > 0 && (
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${tokenExpiry.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{tokenExpiry.isValid ? 'Token is valid' : 'Token has expired'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning if issues detected */}
        {isAuthenticated && !localStorageToken && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                <p className="mt-2 text-sm text-yellow-700">
                  You appear to be authenticated but no token was found in localStorage. This may indicate a sync issue.
                </p>
              </div>
            </div>
          </div>
        )}

        {tokenExpiry && !tokenExpiry.isValid && (
          <div className="bg-red-50 border-l-4 border-red-400 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Token Expired</h3>
                <p className="mt-2 text-sm text-red-700">
                  Your authentication token has expired. Please log out and log back in to continue.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}