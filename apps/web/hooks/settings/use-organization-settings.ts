"use client";

import { useQuery } from "@tanstack/react-query";

import { getOrganizationSettings } from "@/services/settings.service";

export function useOrganizationSettings(organizationId?: string) {
  return useQuery({
    queryKey: ["settings", "organization", organizationId],
    queryFn: () => getOrganizationSettings(organizationId as string),
    enabled: Boolean(organizationId),
  });
}
