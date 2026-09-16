"use client";

import { useQuery } from "@tanstack/react-query";

import { queueService } from "@/services/queue.service";

export function useQueueSummary(organizationId?: string, branchId?: string) {
  return useQuery({
    queryKey: ["queue-summary", organizationId, branchId],

    queryFn: () => {
      if (!organizationId || !branchId) {
        throw new Error("No active branch selected.");
      }

      return queueService.getQueueSummary(organizationId, branchId);
    },

    enabled: Boolean(organizationId && branchId),
  });
}
