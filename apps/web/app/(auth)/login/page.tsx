'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import type { LoginResponse } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      setAuth(response.accessToken, response.user ?? null);

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to login. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border bg-background shadow-xl md:grid-cols-2">
        {/* Branding Panel */}
        <div className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground md:flex md:flex-col md:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/10" />

          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold">
                C
              </div>

              <span className="text-2xl font-bold tracking-tight">
                Cofflo
              </span>
            </div>

            <h1 className="max-w-sm text-4xl font-bold leading-tight">
              Run your café with a smoother flow.
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-6 text-primary-foreground/75">
              Manage your coffee shop operations, staff, products, and
              daily activities in one simple workspace.
            </p>
          </div>

          <div className="relative z-10 text-sm text-primary-foreground/70">
            Your café. Your team. Your flow.
          </div>
        </div>

        {/* Login Panel */}
        <div className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            {/* Mobile Branding */}
            <div className="mb-10 flex items-center gap-3 md:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
                C
              </div>

              <span className="text-2xl font-bold tracking-tight">
                Cofflo
              </span>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold tracking-tight">
                Sign in to Cofflo
              </h2>

              <p className="mt-3 text-sm text-muted-foreground">
                Enter your account details to continue.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                    className="h-11 w-full rounded-xl border bg-background px-3 pr-20 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}