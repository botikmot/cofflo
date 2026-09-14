'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type InvitationDetails = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  organization?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  } | null;
};

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');

  const [invitation, setInvitation] =
    useState<InvitationDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function loadInvitation() {
      if (!token) {
        setError('Invalid or missing invitation token.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/invitations/${token}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ?? 'Invitation is invalid or expired.',
          );
        }

        setInvitation(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load invitation.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid invitation token.');
      return;
    }

    if (!firstName.trim()) {
      setError('Please enter your firstname.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invitations/${token}/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ?? 'Failed to accept invitation.',
        );
      }

      setSuccess(
        'Your account has been created. You can now log in.',
      );

      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to accept invitation.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading invitation...</p>
      </main>
    );
  }

  if (error && !invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border p-6 text-center">
          <h1 className="text-xl font-semibold">
            Invalid Invitation
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            {error}
          </p>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="mt-6 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary">
            Cofflo Invitation
          </p>

          <h1 className="mt-2 text-2xl font-semibold">
            Join your team
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            You have been invited to join{' '}
            <strong>
              {invitation?.organization?.name ?? 'this organization'}
            </strong>
            .
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-muted/50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">
              {invitation?.email}
            </span>
          </div>

          <div className="mt-2 flex justify-between gap-4">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium">
              {invitation?.role}
            </span>
          </div>

          {invitation?.branch && (
            <div className="mt-2 flex justify-between gap-4">
              <span className="text-muted-foreground">Branch</span>
              <span className="font-medium">
                {invitation.branch.name}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              First name
            </label>

            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Juan"
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Last name
            </label>

            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Dela Cruz"
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="At least 8 characters"
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Confirm password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Repeat your password"
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? 'Creating account...'
              : 'Accept invitation'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By accepting this invitation, you agree to use Cofflo
          according to your organization’s access policies.
        </p>
      </div>
    </main>
  );
}