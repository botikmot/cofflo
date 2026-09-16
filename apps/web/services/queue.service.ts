import { apiFetch } from "@/lib/api";

import type {
  AssignQueueTablePayload,
  JoinPublicQueuePayload,
  JoinQueueResponse,
  NextQueueCustomerResponse,
  PublicQueue,
  QueueEntry,
  QueuePositionResponse,
  QueueSummary,
  QueueTable,
} from "@/types/queue";

export const queueService = {
  /*
  |--------------------------------------------------------------------------
  | PUBLIC
  |--------------------------------------------------------------------------
  */

  joinPublicQueue(branchId: string, payload: JoinPublicQueuePayload) {
    return apiFetch<JoinQueueResponse>(`/public/branches/${branchId}/queue`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getPublicQueue(publicToken: string) {
    return apiFetch<PublicQueue>(`/public/queue/${publicToken}`);
  },

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD / STAFF
  |--------------------------------------------------------------------------
  */

  getTodayQueue(organizationId: string, branchId: string) {
    return apiFetch<QueueEntry[]>(
      `/organizations/${organizationId}/branches/${branchId}/queue`,
    );
  },

  getQueueSummary(organizationId: string, branchId: string) {
    return apiFetch<QueueSummary>(
      `/organizations/${organizationId}/branches/${branchId}/queue/summary`,
    );
  },

  getQueuePosition(
    organizationId: string,
    branchId: string,
    queueEntryId: string,
  ) {
    return apiFetch<QueuePositionResponse>(
      `/organizations/${organizationId}/branches/${branchId}/queue/${queueEntryId}/position`,
    );
  },

  callNext(
    organizationId: string,
    branchId: string,
    payload: AssignQueueTablePayload,
  ) {
    return apiFetch<QueueEntry>(
      `/organizations/${organizationId}/branches/${branchId}/queue/call-next`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  markSeated(organizationId: string, branchId: string, queueEntryId: string) {
    return apiFetch<QueueEntry>(
      `/organizations/${organizationId}/branches/${branchId}/queue/${queueEntryId}/seated`,
      {
        method: "POST",
      },
    );
  },

  cancel(organizationId: string, branchId: string, queueEntryId: string) {
    return apiFetch<QueueEntry>(
      `/organizations/${organizationId}/branches/${branchId}/queue/${queueEntryId}/cancel`,
      {
        method: "POST",
      },
    );
  },

  releaseTable(organizationId: string, branchId: string, tableId: string) {
    return apiFetch<QueueTable>(
      `/organizations/${organizationId}/branches/${branchId}/queue/tables/${tableId}/release`,
      {
        method: "POST",
      },
    );
  },

  getNextForTable(organizationId: string, branchId: string, tableId: string) {
    const searchParams = new URLSearchParams({
      tableId,
    });

    return apiFetch<NextQueueCustomerResponse>(
      `/organizations/${organizationId}/branches/${branchId}/queue/next?${searchParams.toString()}`,
    );
  },
};
