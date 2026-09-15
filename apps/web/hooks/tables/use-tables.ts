"use client";

import { useQuery } from "@tanstack/react-query";

import { tableService } from "@/services/tables.service";

type UseTablesParams = {
  organizationId?: string;
  branchId?: string;
};

export function useTables({ organizationId, branchId }: UseTablesParams) {
  return useQuery({
    queryKey: ["tables", organizationId, branchId],

    queryFn: () => tableService.getTables(organizationId!, branchId!),

    enabled: Boolean(organizationId) && Boolean(branchId),

    staleTime: 30 * 1000,
  });
}
