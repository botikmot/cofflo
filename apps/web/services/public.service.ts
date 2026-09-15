import { apiFetch } from "@/lib/api";

import type {
  PublicBranchResponse,
  PublicTableQrResponse,
} from "@/types/public";

export const publicService = {
  getBranch(branchId: string) {
    return apiFetch<PublicBranchResponse>(`/public/branches/${branchId}`);
  },

  getTableByQrToken(qrToken: string) {
    return apiFetch<PublicTableQrResponse>(`/public/tables/${qrToken}`);
  },
};
