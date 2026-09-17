"use client";

import { useQuery } from "@tanstack/react-query";

import { getBranches } from "@/services/branches.service";

export function useBranches(organizationId?: string) {
  return useQuery({
    queryKey: ["branches", organizationId],
    queryFn: () => getBranches(organizationId as string),
    enabled: Boolean(organizationId),
  });
}
