"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { staffService } from "@/services/staff.service";
import type { CreateInvitationPayload } from "@/types/staff";

export function useCreateInvitation(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInvitationPayload) =>
      staffService.createInvitation(organizationId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff-invitations", organizationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["staff", organizationId],
      });
    },
  });
}
