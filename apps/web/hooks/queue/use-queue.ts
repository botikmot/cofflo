"use client";

import { useQuery } from "@tanstack/react-query";

import { queueService } from "@/services/queue.service";

export function useQueue(organizationId?: string, branchId?: string) {
  return useQuery({
    queryKey: ["queue", organizationId, branchId],

    queryFn: () => {
      if (!organizationId || !branchId) {
        throw new Error("No active branch selected.");
      }

      return queueService.getTodayQueue(organizationId, branchId);
    },

    enabled: Boolean(organizationId && branchId),
  });
}
