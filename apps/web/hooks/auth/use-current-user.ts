"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "@/services/auth.service";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
