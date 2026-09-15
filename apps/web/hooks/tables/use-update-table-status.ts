import { useMutation, useQueryClient } from "@tanstack/react-query";

import { tableService, type TableStatus } from "@/services/tables.service";

type Params = {
  organizationId: string;
  branchId: string;
};

export function useUpdateTableStatus({ organizationId, branchId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tableId,
      status,
    }: {
      tableId: string;
      status: TableStatus;
    }) =>
      tableService.updateTableStatus(organizationId, branchId, tableId, status),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tables", organizationId, branchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard", organizationId, branchId],
      });
    },
  });
}
