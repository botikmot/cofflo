"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/services/order.service";

import type { RecordPaymentPayload } from "@/types/order";

type Params = {
  organizationId: string;
  branchId: string;
  orderId: string;
};

export function useRecordPayment({
  organizationId,
  branchId,
  orderId,
}: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecordPaymentPayload) =>
      orderService.recordPayment(organizationId, branchId, orderId, payload),

    onSuccess: (result) => {
      queryClient.setQueryData(
        ["order", organizationId, branchId, orderId],
        result.order,
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
