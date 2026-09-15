import { apiFetch } from "@/lib/api";

import type { PublicMenuResponse } from "@/types/menu";

export const menuService = {
  getPublicMenu(branchId: string) {
    return apiFetch<PublicMenuResponse>(`/public/branches/${branchId}/menu`);
  },
};
