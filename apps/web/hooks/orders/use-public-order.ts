"use client";

import { useQuery } from "@tanstack/react-query";

import { orderService } from "@/services/order.service";

export function usePublicOrder(publicToken: string) {
  return useQuery({
    queryKey: ["public-order", publicToken],
    queryFn: () => orderService.getPublicOrder(publicToken),
    enabled: Boolean(publicToken),
    refetchInterval: 10_000,
  });
}
