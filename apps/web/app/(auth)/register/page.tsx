"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Store,
  UserRound,
} from "lucide-react";

import { onboardOrganization } from "@/services/auth.service";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currencies";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <main className="min-h-screen bg-[#F7F3ED] text-[#2B2118]">
      <div className="grid min-h-screen lg:h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* =====================================================
          LEFT BRAND PANEL
      ====================================================== */}
        <AuthBrandPanel />

        {/* =====================================================
          REGISTER FORM
      ====================================================== */}
        <section className="flex min-h-screen items-center justify-center px-5 py-6 sm:px-8 lg:h-screen lg:min-h-0 lg:px-10 lg:py-6 xl:px-14">
          <div className="w-full max-w-xl">
            {/* Mobile logo */}
            <div className="mb-7 lg:hidden">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF9F3] shadow-[0_8px_30px_rgba(70,45,25,0.08)]">
                <Image
                  src="/images/cofflo-logo.png"
                  alt="Cofflo"
                  width={76}
                  height={76}
                  priority
                  className="h-auto w-[76px]"
                />
              </div>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9A806C]">
                Get started
              </p>

              <h2 className="text-3xl font-semibold tracking-[-0.035em] text-[#2B2118] xl:text-[34px]">
                Create your workspace
              </h2>

              <p className="mt-2 max-w-xl text-xs leading-5 text-[#8B7D70]">
                Set up your Cofflo workspace and start managing your business in
                one simple place.
              </p>
            </div>

            {/* =================================================
              FORM
          ================================================== */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ================= ACCOUNT ================= */}
              <section>
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F0E7DE]">
                    <UserRound
                      className="h-3 w-3 text-[#6F4E37]"
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-[#4F443A]">
                      Your account
                    </h3>

                    <p className="text-[10px] text-[#9A8D82]">
                      Your personal account details
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {/* First name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-1.5 block text-xs font-medium text-[#4F443A]"
                    >
                      First name
                    </label>

                    <div className="relative">
                      <UserRound
                        className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A49384]"
                        strokeWidth={1.8}
                      />

                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                        autoComplete="given-name"
                        placeholder="Juan"
                        disabled={isLoading}
                        className="
                        h-10 w-full rounded-xl
                        border border-[#E3D7CB]
                        bg-[#FFFCF8]
                        pl-10 pr-3
                        text-xs text-[#2B2118]
                        outline-none
                        placeholder:text-[#B5A89C]
                        transition
                        focus:border-[#8B6B53]
                        focus:ring-4 focus:ring-[#8B6B53]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                      />
                    </div>
                  </div>

                  {/* Last name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-1.5 block text-xs font-medium text-[#4F443A]"
                    >
                      Last name
                    </label>

                    <div className="relative">
                      <UserRound
                        className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A49384]"
                        strokeWidth={1.8}
                      />

                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        autoComplete="family-name"
                        placeholder="Dela Cruz"
                        disabled={isLoading}
                        className="
                        h-10 w-full rounded-xl
                        border border-[#E3D7CB]
                        bg-[#FFFCF8]
                        pl-10 pr-3
                        text-xs text-[#2B2118]
                        outline-none
                        placeholder:text-[#B5A89C]
                        transition
                        focus:border-[#8B6B53]
                        focus:ring-4 focus:ring-[#8B6B53]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="lg:col-span-2">
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-medium text-[#4F443A]"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A49384]"
                        strokeWidth={1.8}
                      />

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        disabled={isLoading}
                        className="
                        h-10 w-full rounded-xl
                        border border-[#E3D7CB]
                        bg-[#FFFCF8]
                        pl-10 pr-3
                        text-xs text-[#2B2118]
                        outline-none
                        placeholder:text-[#B5A89C]
                        transition
                        focus:border-[#8B6B53]
                        focus:ring-4 focus:ring-[#8B6B53]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-xs font-medium text-[#4F443A]"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A49384]"
                        strokeWidth={1.8}
                      />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="
                        h-10 w-full rounded-xl
                        border border-[#E3D7CB]
                        bg-[#FFFCF8]
                        pl-10 pr-10
                        text-xs text-[#2B2118]
                        outline-none
                        placeholder:text-[#B5A89C]
                        transition
                        focus:border-[#8B6B53]
                        focus:ring-4 focus:ring-[#8B6B53]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        disabled={isLoading}
                        className="
                        absolute right-2 top-1/2
                        flex h-7 w-7
                        -translate-y-1/2
                        items-center justify-center
                        rounded-lg
                        text-[#958476]
                        transition
                        hover:bg-[#F2EAE2]
                        hover:text-[#5C4636]
                      "
                      >
                        {showPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="mt-1 text-[10px] text-[#9A8D82]">
                      At least 8 characters.
                    </p>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1.5 block text-xs font-medium text-[#4F443A]"
                    >
                      Confirm password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A49384]"
                        strokeWidth={1.8}
                      />

                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="
                        h-10 w-full rounded-xl
                        border border-[#E3D7CB]
                        bg-[#FFFCF8]
                        pl-10 pr-10
                        text-xs text-[#2B2118]
                        outline-none
                        placeholder:text-[#B5A89C]
                        transition
                        focus:border-[#8B6B53]
                        focus:ring-4 focus:ring-[#8B6B53]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        disabled={isLoading}
                        className="
                        absolute right-2 top-1/2
                        flex h-7 w-7
                        -translate-y-1/2
                        items-center justify-center
                        rounded-lg
                        text-[#958476]
                        transition
                        hover:bg-[#F2EAE2]
                        hover:text-[#5C4636]
                      "
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* ================= BUSINESS ================= */}
              <section className="border-t border-[#EEE5DC] pt-4">
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F0E7DE]">
                    <Building2
                      className="h-3 w-3 text-[#6F4E37]"
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-[#4F443A]">
                      Your business
                    </h3>

                    <p className="text-[10px] text-[#9A8D82]">
                      You can update these details later.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {/* Organization */}
                  <div>
                    <label
                      htmlFor="organizationName"
                      className="mb-1.5 block text-xs font-medium text-[#4F443A]"
                    >
                      Organization name
                    </label>

                    <div className="relative">
                      <Building2
                        className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A49384]"
                        strokeWidth={1.8}
                      />

                      <input
                        id="organizationName"
                        type="text"
                        value={organizationName}
                        onChange={(event) =>
                          setOrganizationName(event.target.value)
                        }
                        required
                        placeholder="Juan's Coffee"
                        disabled={isLoading}
                        className="
                        h-10 w-full rounded-xl
                        border border-[#E3D7CB]
                        bg-[#FFFCF8]
                        pl-10 pr-3
                        text-xs text-[#2B2118]
                        outline-none
                        placeholder:text-[#B5A89C]
                        transition
                        focus:border-[#8B6B53]
                        focus:ring-4 focus:ring-[#8B6B53]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                      />
                    </div>
                  </div>

                  {/* Branch */}
                  <div>
                    <label
                      htmlFor="branchName"
                      className="mb-1.5 block text-xs font-medium text-[#4F443A]"
                    >
                      Branch name
                    </label>

                    <div className="relative">
                      <Store
                        className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A49384]"
                        strokeWidth={1.8}
                      />

                      <input
                        id="branchName"
                        type="text"
                        value={branchName}
                        onChange={(event) => setBranchName(event.target.value)}
                        required
                        placeholder="Main Branch"
                        disabled={isLoading}
                        className="
                        h-10 w-full rounded-xl
                        border border-[#E3D7CB]
                        bg-[#FFFCF8]
                        pl-10 pr-3
                        text-xs text-[#2B2118]
                        outline-none
                        placeholder:text-[#B5A89C]
                        transition
                        focus:border-[#8B6B53]
                        focus:ring-4 focus:ring-[#8B6B53]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                      />
                    </div>
                  </div>

                  {/* Currency */}
                  <div className="lg:col-span-2">
                    <label
                      htmlFor="currency"
                      className="mb-1.5 block text-xs font-medium text-[#4F443A]"
                    >
                      Currency
                    </label>

                    <div className="relative">
                      <select
                        id="currency"
                        value={currency}
                        onChange={(event) =>
                          setCurrency(event.target.value as SupportedCurrency)
                        }
                        disabled={isLoading}
                        className="
                        h-10 w-full
                        appearance-none
                        rounded-xl
                        border border-[#E3D7CB]
                        bg-[#FFFCF8]
                        px-3 pr-10
                        text-xs text-[#2B2118]
                        outline-none
                        transition
                        focus:border-[#8B6B53]
                        focus:ring-4 focus:ring-[#8B6B53]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                      >
                        {SUPPORTED_CURRENCIES.map((currencyOption) => (
                          <option key={currencyOption} value={currencyOption}>
                            {CURRENCY_LABELS[currencyOption]}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        className="
                        pointer-events-none
                        absolute right-3.5 top-1/2
                        h-3.5 w-3.5
                        -translate-y-1/2
                        text-[#8E8074]
                      "
                        strokeWidth={2}
                      />
                    </div>

                    <p className="mt-1 text-[10px] text-[#9A8D82]">
                      Used for your initial business transactions.
                    </p>
                  </div>
                </div>
              </section>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="
                  rounded-xl
                  border border-[#E8CFC5]
                  bg-[#FBF0EC]
                  px-3.5 py-2.5
                "
                >
                  <p className="text-xs leading-5 text-[#8A4E3A]">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="
                flex h-11 w-full
                items-center justify-center gap-2
                rounded-xl
                bg-[#6F4E37]
                px-4
                text-xs font-semibold
                text-white
                shadow-[0_8px_20px_rgba(111,78,55,0.18)]
                transition
                hover:bg-[#5D402D]
                hover:shadow-[0_10px_24px_rgba(111,78,55,0.24)]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creating your workspace...
                  </>
                ) : (
                  "Create workspace"
                )}
              </button>
            </form>

            {/* Login */}
            <div className="mt-5 text-center">
              <p className="text-xs text-[#8B7D70]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="
                  font-semibold
                  text-[#6F4E37]
                  transition
                  hover:text-[#4B3022]
                  hover:underline
                "
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Trust */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#AA9B8D]">
              <span className="h-1 w-1 rounded-full bg-[#B99A7C]" />
              Secure workspace setup
              <span className="h-1 w-1 rounded-full bg-[#B99A7C]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
