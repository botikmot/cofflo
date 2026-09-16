import { useMutation, useQueryClient } from "@tanstack/react-query";

import { tableSessionService } from "@/services/table-session.service";

type Params = {
  organizationId: string;
  branchId: string;
  tableId: string;
};

export function useCloseTableSession({
  organizationId,
  branchId,
  tableId,
}: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      tableSessionService.closeSession(
        organizationId,
        branchId,
        tableId,
        sessionId,
      ),

    onSuccess: (session) => {
      queryClient.invalidateQueries({
        queryKey: ["table-session", organizationId, branchId, session.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["tables", organizationId, branchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard", organizationId, branchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["orders", organizationId, branchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["queue", organizationId, branchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["queue-summary", organizationId, branchId],
      });
    },
  });
}
