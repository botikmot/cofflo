"use client";

import { useQuery } from "@tanstack/react-query";

import { staffService } from "@/services/staff.service";

export function useInvitations(organizationId?: string) {
  return useQuery({
    queryKey: ["staff-invitations", organizationId],
    queryFn: () => staffService.getInvitations(organizationId!),
    enabled: Boolean(organizationId),
    staleTime: 30 * 1000,
  });
}
