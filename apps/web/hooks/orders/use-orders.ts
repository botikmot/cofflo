"use client";

import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/services/order.service";
import type { OrderStatus } from "@/types/order";

type UseOrdersParams = {
  organizationId?: string;
  branchId?: string;
  page?: number;
  limit?: number;
  status?: "ALL" | OrderStatus;
  search?: string;
};

export function useOrders({
  organizationId,
  branchId,
  page = 1,
  limit = 20,
  status = "ALL",
  search = "",
}: UseOrdersParams) {
  return useQuery({
    queryKey: ["orders", organizationId, branchId, page, limit, status, search],

    queryFn: () =>
      orderService.getOrders(organizationId!, branchId!, {
        page,
        limit,
        status,
        search,
      }),

    enabled: Boolean(organizationId) && Boolean(branchId),

    staleTime: 15 * 1000,

    refetchInterval: 15 * 1000,

    placeholderData: (previousData) => previousData,
  });
}
