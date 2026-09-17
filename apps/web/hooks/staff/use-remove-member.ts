"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { staffService } from "@/services/staff.service";

type Params = {
  organizationId: string;
};

export function useRemoveMember({ organizationId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipId: string) =>
      staffService.removeMember(organizationId, membershipId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff", organizationId],
      });
    },
  });
}
