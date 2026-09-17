"use client";

import { useQuery } from "@tanstack/react-query";

import { publicService } from "@/services/public.service";

export function usePublicTables(branchId: string, enabled = true) {
  return useQuery({
    queryKey: ["public-tables", branchId],
    queryFn: () => publicService.getAvailableTables(branchId),
    enabled: Boolean(branchId) && enabled,
  });
}
