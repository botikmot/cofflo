"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login, selectContext } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F3ED] px-4">
      <div className="w-full max-w-md rounded-[32px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 shadow-[0_20px_60px_rgba(70,45,25,0.08)]">
        <div className="mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6F4E37] text-lg font-semibold text-white">
            Y
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#2B2118]">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-[#8B7D70]">
            Sign in to continue to your workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#4F443A]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-[#E4D8CB] bg-[#FAF6F1] px-4 py-3 text-sm outline-none transition focus:border-[#6F4E37]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#4F443A]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-2xl border border-[#E4D8CB] bg-[#FAF6F1] px-4 py-3 text-sm outline-none transition focus:border-[#6F4E37]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-[#F7E9E4] px-4 py-3 text-sm text-[#8A4E3A]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-[#6F4E37] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5D402D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
