"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardData } from "@/services/dashboard.service";

type UseDashboardParams = {
  organizationId?: string;
  branchId?: string;
};

export function useDashboard({ organizationId, branchId }: UseDashboardParams) {
  return useQuery({
    queryKey: ["dashboard", organizationId, branchId],

    queryFn: () => getDashboardData(organizationId!, branchId!),

    enabled: Boolean(organizationId) && Boolean(branchId),

    staleTime: 30 * 1000,

    refetchInterval: 60 * 1000,
  });
}
