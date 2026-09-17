"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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

function formatRole(role: string) {
  switch (role) {
    case "OWNER":
      return "Owner";

    case "ADMIN":
      return "Administrator";

    case "MANAGER":
      return "Manager";

    case "STAFF":
      return "Staff";

    default:
      return role;
  }
}

function formatExpiry(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInvitation() {
      if (!token) {
        if (!cancelled) {
          setError("Invalid or missing invitation token.");
          setLoading(false);
        }

        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/invitations/${token}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ?? "This invitation is invalid or has expired.",
          );
        }

        if (!cancelled) {
          setInvitation(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load invitation.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid invitation token.");
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName) {
      setError("Please enter your first name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invitations/${token}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to accept invitation.");
      }

      setSuccess(
        "Your account has been created successfully. Redirecting you to login...",
      );

      window.setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept invitation.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F3ED] px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
          <div className="w-full rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 shadow-[0_18px_50px_rgba(66,46,32,0.07)]">
            <div className="mx-auto h-14 w-14 animate-pulse rounded-2xl bg-[#EDE2D8]" />

            <div className="mt-6 space-y-3">
              <div className="mx-auto h-3 w-28 animate-pulse rounded bg-[#E7DDD3]" />
              <div className="mx-auto h-7 w-48 animate-pulse rounded bg-[#E1D6CB]" />
              <div className="mx-auto h-4 w-64 animate-pulse rounded bg-[#E7DDD3]" />
            </div>

            <div className="mt-8 space-y-3">
              <div className="h-11 animate-pulse rounded-xl bg-[#F1E9E2]" />
              <div className="h-11 animate-pulse rounded-xl bg-[#F1E9E2]" />
              <div className="h-11 animate-pulse rounded-xl bg-[#F1E9E2]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !invitation) {
    return (
      <main className="min-h-screen bg-[#F7F3ED] px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
          <div className="w-full rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center shadow-[0_18px_50px_rgba(66,46,32,0.07)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8E5E1] text-[#97483F]">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#97483F]">
              Invitation unavailable
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#2B2118]">
              Invalid invitation
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#74665A]">{error}</p>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-7 flex h-11 w-full items-center justify-center rounded-xl bg-[#2B2118] px-4 text-sm font-semibold text-white transition hover:bg-[#3A2B20]"
            >
              Go to login
            </button>
          </div>
        </div>
      </main>
    );
  }

  const organizationName =
    invitation?.organization?.name ?? "Your organization";

  const branchName = invitation?.branch?.name;

  const roleLabel = invitation ? formatRole(invitation.role) : "Staff";

  const expiryLabel = invitation ? formatExpiry(invitation.expiresAt) : "";

  return (
    <main className="min-h-screen bg-[#F7F3ED] px-4 py-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center justify-center">
        <div className="w-full">
          {/* Brand-neutral header */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6F4E37] text-white shadow-sm">
              <UserRound className="h-7 w-7" />
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B7A6C]">
              Team invitation
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2B2118]">
              Join your team
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#74665A]">
              You&apos;ve been invited to join{" "}
              <span className="font-semibold text-[#4D4037]">
                {organizationName}
              </span>
              .
            </p>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-[#E5D9CD] bg-[#FFFDF9] shadow-[0_22px_60px_rgba(66,46,32,0.08)]">
            {/* Invitation summary */}
            <div className="border-b border-[#E8DDD3] bg-[#F4EDE5] px-6 py-5 sm:px-7">
              <div className="grid gap-3">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E9DED3] text-[#6F4E37]">
                    <Mail className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8B7A6C]">
                      Invited email
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-[#2B2118]">
                      {invitation?.email}
                    </p>
                  </div>
                </div>

                {/* Organization */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E9DED3] text-[#6F4E37]">
                    <Building2 className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8B7A6C]">
                      Organization
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#2B2118]">
                      {organizationName}
                    </p>
                  </div>
                </div>

                {/* Role / Branch */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#E3D8CD] bg-[#FFFDF9] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8B7A6C]">
                      Role
                    </p>

                    <span className="mt-2 inline-flex rounded-full bg-[#F0E6DA] px-2.5 py-1 text-xs font-semibold text-[#6F4E37]">
                      {roleLabel}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-[#E3D8CD] bg-[#FFFDF9] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8B7A6C]">
                      Branch
                    </p>

                    <div className="mt-2 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#6F4E37]" />

                      <p className="text-xs font-semibold text-[#4D4037]">
                        {branchName ?? "Organization-wide"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#8C7E73]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#6F4E37]" />
                  Invitation expires on {expiryLabel}
                </div>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-6 sm:px-7 sm:py-7"
            >
              <div>
                <h2 className="text-sm font-semibold text-[#2B2118]">
                  Create your account
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#8A7C71]">
                  Set up your name and password to access the team workspace.
                </p>
              </div>

              {/* First name */}
              <div className="space-y-2">
                <label
                  htmlFor="first-name"
                  className="text-sm font-medium text-[#3E342D]"
                >
                  First name
                </label>

                <input
                  id="first-name"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Juan"
                  autoComplete="given-name"
                  disabled={submitting}
                  className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3.5 text-sm text-[#2B2118] outline-none placeholder:text-[#A99A8D] transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Last name */}
              <div className="space-y-2">
                <label
                  htmlFor="last-name"
                  className="text-sm font-medium text-[#3E342D]"
                >
                  Last name
                </label>

                <input
                  id="last-name"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Dela Cruz"
                  autoComplete="family-name"
                  disabled={submitting}
                  className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3.5 text-sm text-[#2B2118] outline-none placeholder:text-[#A99A8D] transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#3E342D]"
                >
                  Password
                </label>

                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#988A7E]" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    disabled={submitting}
                    className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-10 pr-11 text-sm text-[#2B2118] outline-none placeholder:text-[#A99A8D] transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={submitting}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#887B70] transition hover:bg-[#F3ECE5] hover:text-[#6F4E37]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-[#8C7E73]">
                  Use at least 8 characters.
                </p>
              </div>

              {/* Confirm password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-[#3E342D]"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#988A7E]" />

                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    disabled={submitting}
                    className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-10 pr-11 text-sm text-[#2B2118] outline-none placeholder:text-[#A99A8D] transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    disabled={submitting}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#887B70] transition hover:bg-[#F3ECE5] hover:text-[#6F4E37]"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium leading-5 text-red-700">
                    {error}
                  </p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-2xl border border-[#CDE3D1] bg-[#EDF7EE] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#4C7656]" />

                    <p className="text-sm font-medium leading-5 text-[#41674A]">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2B2118] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3A2B20] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Creating account..." : "Accept invitation"}
              </button>
            </form>
          </div>

          <p className="mx-auto mt-5 max-w-md text-center text-xs leading-5 text-[#9A8A7D]">
            By accepting this invitation, you&apos;ll gain access according to
            the role and branch assigned by your organization.
          </p>
        </div>
      </div>
    </main>
  );
}
