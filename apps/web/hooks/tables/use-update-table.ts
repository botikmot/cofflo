import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  tableService,
  type UpdateTablePayload,
} from "@/services/tables.service";

type Params = {
  organizationId: string;
  branchId: string;
};

export function useUpdateTable({ organizationId, branchId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tableId,
      payload,
    }: {
      tableId: string;
      payload: UpdateTablePayload;
    }) => tableService.updateTable(organizationId, branchId, tableId, payload),

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
