"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  orderService,
  type CreateOrderPayload,
} from "@/services/order.service";

type Params = {
  organizationId: string;
  branchId: string;
};

export function useCreateOrder({ organizationId, branchId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      orderService.createOrder(organizationId, branchId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders", organizationId, branchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}
