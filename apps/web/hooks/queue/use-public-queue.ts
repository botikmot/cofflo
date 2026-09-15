"use client";

import { useQuery } from "@tanstack/react-query";

import { queueService } from "@/services/queue.service";

export function usePublicQueue(publicToken: string) {
  return useQuery({
    queryKey: ["public-queue", publicToken],
    queryFn: () => queueService.getPublicQueue(publicToken),
    enabled: Boolean(publicToken),
    refetchInterval: 10_000,
  });
}
