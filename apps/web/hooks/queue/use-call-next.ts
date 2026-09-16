"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queueService } from "@/services/queue.service";

import type { AssignQueueTablePayload } from "@/types/queue";

export function useCallNext(organizationId?: string, branchId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignQueueTablePayload) => {
      if (!organizationId || !branchId) {
        throw new Error("No active branch selected.");
      }

      return queueService.callNext(organizationId, branchId, payload);
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["queue", organizationId, branchId],
        }),

        queryClient.invalidateQueries({
          queryKey: ["queue-summary", organizationId, branchId],
        }),

        queryClient.invalidateQueries({
          queryKey: ["tables", organizationId, branchId],
        }),
      ]);
    },
  });
}
