"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { CoffeeLoading } from "@/components/ui/coffee-loading";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();

  const { data, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (isError || !data)) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("activeMembershipId");

      router.replace("/login");
    }
  }, [data, isError, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-[70vh] pt-6">
        <CoffeeLoading message="Returning you to sign in" />
      </div>
    );
  }

  return <>{children}</>;
}
