'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { Dog, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
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
          Reset Your Password
        </h1>
        <p className="mt-3 text-center text-lg text-gray-600">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </header>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 sm:px-10">
          {sent ? (
            <div className="text-center" role="status">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-gray-600 mb-6">
                If <span className="font-semibold">{email}</span> is registered, a reset
                link is on its way. The link expires in 1 hour.
              </p>
              <Link href="/login" className="btn-secondary inline-flex items-center justify-center py-3 px-6">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@example.com"
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
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          )}
        </Card>

        <p className="mt-8 text-center text-sm text-gray-600">
          Remembered it after all?{' '}
          <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
