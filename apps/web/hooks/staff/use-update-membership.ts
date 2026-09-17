"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { staffService } from "@/services/staff.service";
import type { UpdateMembershipPayload } from "@/types/staff";

type Params = {
  organizationId: string;
};

export function useUpdateMembership({ organizationId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      membershipId,
      payload,
    }: {
      membershipId: string;
      payload: UpdateMembershipPayload;
    }) => staffService.updateMember(organizationId, membershipId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff", organizationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["auth-context"],
      });

      queryClient.invalidateQueries({
        queryKey: ["auth-me"],
      });
    },
  });
}
