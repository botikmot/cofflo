import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  tableService,
  type CreateTablePayload,
} from "@/services/tables.service";

export function useCreateTable(organizationId: string, branchId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTablePayload) =>
      tableService.createTable(organizationId, branchId, payload),

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
