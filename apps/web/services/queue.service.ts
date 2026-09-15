import { apiFetch } from "@/lib/api";

import type {
  JoinPublicQueuePayload,
  JoinQueueResponse,
  PublicQueue,
} from "@/types/queue";

export const queueService = {
  joinPublicQueue(branchId: string, payload: JoinPublicQueuePayload) {
    return apiFetch<JoinQueueResponse>(`/public/branches/${branchId}/queue`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getPublicQueue(publicToken: string) {
    return apiFetch<PublicQueue>(`/public/queue/${publicToken}`);
  },
};
