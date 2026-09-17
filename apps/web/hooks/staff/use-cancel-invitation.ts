"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { staffService } from "@/services/staff.service";

export function useCancelInvitation(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      staffService.cancelInvitation(organizationId, invitationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff-invitations", organizationId],
      });
    },
  });
}
