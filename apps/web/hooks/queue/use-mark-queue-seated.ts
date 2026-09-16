"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queueService } from "@/services/queue.service";

export function useMarkQueueSeated(organizationId?: string, branchId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queueEntryId: string) => {
      if (!organizationId || !branchId) {
        throw new Error("No active branch selected.");
      }

      return queueService.markSeated(organizationId, branchId, queueEntryId);
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
