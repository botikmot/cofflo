"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queueService } from "@/services/queue.service";

export function useReleaseQueueTable(
  organizationId?: string,
  branchId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tableId: string) => {
      if (!organizationId || !branchId) {
        throw new Error("No active branch selected.");
      }

      return queueService.releaseTable(organizationId, branchId, tableId);
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
