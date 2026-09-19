"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { onboardOrganization } from "@/services/auth.service";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currencies";

export default function RegisterPage() {
  const router = useRouter();

  // Account
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Organization
  const [organizationName, setOrganizationName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("PHP");

  // UI
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedOrganizationName = organizationName.trim();
    const normalizedBranchName = branchName.trim();

    if (!normalizedFirstName) {
      setError("Please enter your first name.");
      return;
    }

    if (!normalizedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!normalizedOrganizationName) {
      setError("Please enter your organization name.");
      return;
    }

    if (!normalizedBranchName) {
      setError("Please enter your branch name.");
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

    setIsLoading(true);

    try {
      const result = await onboardOrganization({
        firstName: normalizedFirstName,
        lastName: normalizedLastName || undefined,
        email: normalizedEmail,
        password,
        organizationName: normalizedOrganizationName,
        branchName: normalizedBranchName,
        currency,
      });

      /*
       * The onboarding endpoint already returns a
       * context-aware access token because the backend
       * creates the user, organization, branch, and
       * OWNER membership in one transaction.
       */
      localStorage.setItem("accessToken", result.accessToken);

      localStorage.setItem("activeMembershipId", result.membership.id);

      router.replace("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your workspace.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
    PHP: "PHP — Philippine Peso",
    USD: "USD — US Dollar",
    EUR: "EUR — Euro",
    GBP: "GBP — British Pound",
    AUD: "AUD — Australian Dollar",
    CAD: "CAD — Canadian Dollar",
    SGD: "SGD — Singapore Dollar",
    MYR: "MYR — Malaysian Ringgit",
    JPY: "JPY — Japanese Yen",
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F3ED] px-4 py-10">
      <div className="w-full max-w-lg rounded-[32px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 shadow-[0_20px_60px_rgba(70,45,25,0.08)] sm:p-10">
        {/* Brand */}
        <div className="mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6F4E37] text-lg font-semibold text-white">
            Y
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#2B2118]">
            Create your workspace
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#8B7D70]">
            Set up your Cofflo account and business workspace to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* =========================
              ACCOUNT
          ========================== */}
          <section>
            <h2 className="text-sm font-semibold text-[#4F443A]">
              Your account
            </h2>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {/* First name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-[#4F443A]"
                >
                  First name
                </label>

                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  autoComplete="given-name"
                  placeholder="Juan"
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-[#E4D8CB] bg-[#FAF6F1] px-4 py-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B1A49A] focus:border-[#6F4E37] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Last name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-[#4F443A]"
                >
                  Last name
                </label>

                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  autoComplete="family-name"
                  placeholder="Dela Cruz"
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-[#E4D8CB] bg-[#FAF6F1] px-4 py-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B1A49A] focus:border-[#6F4E37] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          </section>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#4F443A]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isLoading}
              className="w-full rounded-2xl border border-[#E4D8CB] bg-[#FAF6F1] px-4 py-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B1A49A] focus:border-[#6F4E37] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Password */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#4F443A]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full rounded-2xl border border-[#E4D8CB] bg-[#FAF6F1] px-4 py-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B1A49A] focus:border-[#6F4E37] disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-1.5 text-xs text-[#9A8D82]">
                At least 8 characters.
              </p>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[#4F443A]"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full rounded-2xl border border-[#E4D8CB] bg-[#FAF6F1] px-4 py-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B1A49A] focus:border-[#6F4E37] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* =========================
              BUSINESS
          ========================== */}
          <section className="border-t border-[#EEE5DC] pt-6">
            <h2 className="text-sm font-semibold text-[#4F443A]">
              Your business
            </h2>

            <p className="mt-1 text-xs text-[#9A8D82]">
              You can update these details later.
            </p>

            <div className="mt-4 space-y-4">
              {/* Organization */}
              <div>
                <label
                  htmlFor="organizationName"
                  className="mb-2 block text-sm font-medium text-[#4F443A]"
                >
                  Organization name
                </label>

                <input
                  id="organizationName"
                  type="text"
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  required
                  placeholder="Juan's Coffee"
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-[#E4D8CB] bg-[#FAF6F1] px-4 py-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B1A49A] focus:border-[#6F4E37] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Branch */}
              <div>
                <label
                  htmlFor="branchName"
                  className="mb-2 block text-sm font-medium text-[#4F443A]"
                >
                  Branch name
                </label>

                <input
                  id="branchName"
                  type="text"
                  value={branchName}
                  onChange={(event) => setBranchName(event.target.value)}
                  required
                  placeholder="Main Branch"
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-[#E4D8CB] bg-[#FAF6F1] px-4 py-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B1A49A] focus:border-[#6F4E37] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="currency"
                  className="text-sm font-medium text-[#24180f]"
                >
                  Currency
                </label>

                <div className="relative">
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) =>
                      setCurrency(e.target.value as SupportedCurrency)
                    }
                    className="
                        h-12
                        w-full
                        appearance-none
                        rounded-[14px]
                        border
                        border-[#e6d8ca]
                        bg-[#fcf8f3]
                        px-4
                        pr-11
                        text-sm
                        text-[#24180f]
                        outline-none
                        transition
                        focus:border-[#7a5138]
                        focus:ring-2
                        focus:ring-[#7a5138]/10
                    "
                  >
                    {SUPPORTED_CURRENCIES.map((currency) => (
                      <option key={currency} value={currency}>
                        {CURRENCY_LABELS[currency]}
                      </option>
                    ))}
                  </select>

                  {/* Custom arrow */}
                  <div
                    className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        right-4
                        flex
                        items-center
                        text-[#6b5a4d]
                    "
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-2xl bg-[#F7E9E4] px-4 py-3 text-sm leading-5 text-[#8A4E3A]"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-[#6F4E37] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5D402D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating your workspace..." : "Create workspace"}
          </button>
        </form>

        {/* Login */}
        <p className="mt-6 text-center text-sm text-[#8B7D70]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#6F4E37] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
