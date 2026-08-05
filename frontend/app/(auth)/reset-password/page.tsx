'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { Dog, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password updated — you can now sign in');
      router.push('/login');
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <header className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center group" aria-label="DogMate home">
          <span className="block bg-gradient-to-br from-primary-600 to-primary-700 p-4 rounded-2xl shadow-xl group-hover:scale-110 transition-transform">
            <Dog className="h-10 w-10 text-white" aria-hidden="true" />
          </span>
        </Link>

        <h1 className="mt-8 text-center text-4xl font-bold text-gray-900">
          Choose a New Password
        </h1>
        <p className="mt-3 text-center text-lg text-gray-600">
          Enter and confirm your new password below
        </p>
      </header>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10">
          {!token ? (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                This reset link is missing its token. Please use the link from your
                email, or request a new one.
              </p>
              <Link href="/forgot-password" className="btn-primary inline-flex items-center justify-center py-3 px-6">
                Request New Link
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full btn-primary flex items-center justify-center text-base py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" aria-hidden="true" />
                    Updating...
                  </>
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          )}
        </Card>

        <p className="mt-8 text-center text-sm text-gray-600">
          <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

// useSearchParams() requires a Suspense boundary for prerendering
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
