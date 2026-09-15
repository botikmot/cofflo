"use client";

import { useQuery } from "@tanstack/react-query";

import { menuService } from "@/services/menu.service";

export function usePublicMenu(branchId: string) {
  return useQuery({
    queryKey: ["public-menu", branchId],
    queryFn: () => menuService.getPublicMenu(branchId),
    enabled: Boolean(branchId),
  });
}
