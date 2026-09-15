"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/services/order.service";

import type { OrderStatus } from "@/types/order";

type Params = {
  organizationId: string;
  branchId: string;
  orderId: string;
};

export function useUpdateOrderStatus({
  organizationId,
  branchId,
  orderId,
}: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: OrderStatus) =>
      orderService.updateStatus(organizationId, branchId, orderId, { status }),

    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(
        ["order", organizationId, branchId, orderId],
        updatedOrder,
      );

      queryClient.invalidateQueries({
        queryKey: ["orders", organizationId, branchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}
