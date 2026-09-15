"use client";

import { useQuery } from "@tanstack/react-query";

import { publicService } from "@/services/public.service";

export function usePublicBranch(branchId: string) {
  return useQuery({
    queryKey: ["public-branch", branchId],
    queryFn: () => publicService.getBranch(branchId),
    enabled: Boolean(branchId),
  });
}
