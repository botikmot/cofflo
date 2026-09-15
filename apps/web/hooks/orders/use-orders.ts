"use client";

import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/services/order.service";

type UseOrdersParams = {
  organizationId?: string;
  branchId?: string;
};

export function useOrders({ organizationId, branchId }: UseOrdersParams) {
  return useQuery({
    queryKey: ["orders", organizationId, branchId],

    queryFn: () => orderService.getOrders(organizationId!, branchId!),

    enabled: Boolean(organizationId) && Boolean(branchId),

    staleTime: 15 * 1000,

    refetchInterval: 15 * 1000,
  });
}
