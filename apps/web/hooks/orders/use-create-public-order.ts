"use client";

import { useMutation } from "@tanstack/react-query";

import { orderService } from "@/services/order.service";

import type { CreatePublicOrderPayload } from "@/types/order";

export function useCreatePublicOrder(branchId: string) {
  return useMutation({
    mutationFn: (payload: CreatePublicOrderPayload) =>
      orderService.createPublicOrder(branchId, payload),
  });
}
