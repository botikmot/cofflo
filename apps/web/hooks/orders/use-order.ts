"use client";

import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/services/order.service";

type UseOrderParams = {
  organizationId?: string;
  branchId?: string;
  orderId?: string;
};

export function useOrder({
  organizationId,
  branchId,
  orderId,
}: UseOrderParams) {
  return useQuery({
    queryKey: ["order", organizationId, branchId, orderId],

    queryFn: () => orderService.getOrder(organizationId!, branchId!, orderId!),

    enabled: Boolean(organizationId) && Boolean(branchId) && Boolean(orderId),
  });
}
