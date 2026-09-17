"use client";

import { useQuery } from "@tanstack/react-query";

import { reportsService } from "@/services/reports.service";

type Params = {
  organizationId?: string;
  branchId?: string;
  from: string;
  to: string;
};

export function useReport({ organizationId, branchId, from, to }: Params) {
  return useQuery({
    queryKey: ["reports", organizationId, branchId, from, to],

    queryFn: () =>
      reportsService.getReport({
        organizationId: organizationId!,
        branchId,
        from,
        to,
      }),

    enabled: Boolean(organizationId) && Boolean(from) && Boolean(to),

    staleTime: 30 * 1000,
  });
}
