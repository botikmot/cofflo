"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

import { login, selectContext } from "@/services/auth.service";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const result = await login({
        email,
        password,
      });

      localStorage.setItem("accessToken", result.accessToken);

      const membership = result.memberships[0];

      if (!membership) {
        throw new Error("Your account has no organization or branch access.");
      }

      const context = await selectContext({
        organizationId: membership.organizationId,
        branchId: membership.branchId,
      });

      localStorage.setItem("accessToken", context.accessToken);
      localStorage.setItem("activeMembershipId", context.context.membershipId);

      router.replace("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F3ED] text-[#2B2118]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT BRAND PANEL */}
        <AuthBrandPanel />

        {/* RIGHT LOGIN */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-10 lg:hidden">
              <Image
                src="/images/cofflo-logo.png"
                alt="Cofflo"
                width={150}
                height={50}
                priority
                className="h-auto w-[140px]"
              />
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A806C]">
                Welcome back
              </p>

              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#2B2118] sm:text-4xl">
                Sign in {/* to Cofflo */}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#8B7D70]">
                Continue managing your workspace and keep your business moving.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#4F443A]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A49384]"
                    strokeWidth={1.8}
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="you@example.com"
                    className="
                      h-12 w-full rounded-2xl
                      border border-[#E3D7CB]
                      bg-[#FFFCF8]
                      pl-11 pr-4
                      text-sm text-[#2B2118]
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
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#4F443A]"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#7A5A42] transition hover:text-[#4B3022]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A49384]"
                    strokeWidth={1.8}
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className="
                      h-12 w-full rounded-2xl
                      border border-[#E3D7CB]
                      bg-[#FFFCF8]
                      pl-11 pr-12
                      text-sm text-[#2B2118]
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="
                      absolute right-3 top-1/2
                      flex h-8 w-8
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
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-[#E8CFC5] bg-[#FBF0EC] px-4 py-3.5">
                  <p className="text-sm leading-5 text-[#8A4E3A]">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="
                  flex h-12 w-full
                  items-center justify-center gap-2
                  rounded-2xl
                  bg-[#6F4E37]
                  px-4
                  text-sm font-semibold
                  text-white
                  shadow-[0_10px_25px_rgba(111,78,55,0.18)]
                  transition
                  hover:bg-[#5D402D]
                  hover:shadow-[0_12px_30px_rgba(111,78,55,0.24)]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Register */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#8B7D70]">
                Don&apos;t have a workspace yet?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#6F4E37] hover:text-[#4B3022] hover:underline"
                >
                  Create workspace
                </Link>
              </p>
            </div>

            {/* Small trust line */}
            <div className="mt-10 flex items-center justify-center gap-2 text-[11px] text-[#AA9B8D]">
              <span className="h-1 w-1 rounded-full bg-[#B99A7C]" />
              Secure workspace access
              <span className="h-1 w-1 rounded-full bg-[#B99A7C]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
