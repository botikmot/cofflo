"use client";

import { useQuery } from "@tanstack/react-query";

import { publicService } from "@/services/public.service";

export function usePublicTable(qrToken: string) {
  return useQuery({
    queryKey: ["public-table", qrToken],
    queryFn: () => publicService.getTableByQrToken(qrToken),
    enabled: Boolean(qrToken),
  });
}
