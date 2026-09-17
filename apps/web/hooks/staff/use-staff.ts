"use client";

import { useQuery } from "@tanstack/react-query";

import { staffService } from "@/services/staff.service";

export function useStaff(organizationId?: string) {
  return useQuery({
    queryKey: ["staff", organizationId],
    queryFn: () => staffService.getMembers(organizationId!),
    enabled: Boolean(organizationId),
    staleTime: 30 * 1000,
  });
}
