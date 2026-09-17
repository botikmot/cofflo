"use client";

import { useQuery } from "@tanstack/react-query";

import { getBranchSettings } from "@/services/settings.service";

export function useBranchSettings(organizationId?: string, branchId?: string) {
  return useQuery({
    queryKey: ["settings", "branch", organizationId, branchId],
    queryFn: () =>
      getBranchSettings(organizationId as string, branchId as string),
    enabled: Boolean(organizationId) && Boolean(branchId),
  });
}
