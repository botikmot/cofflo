"use client";

import { useMutation } from "@tanstack/react-query";

import { queueService } from "@/services/queue.service";

import type { JoinPublicQueuePayload } from "@/types/queue";

export function useJoinQueue(branchId: string) {
  return useMutation({
    mutationFn: (payload: JoinPublicQueuePayload) =>
      queueService.joinPublicQueue(branchId, payload),
  });
}
