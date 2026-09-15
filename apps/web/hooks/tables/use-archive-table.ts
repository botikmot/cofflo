import { useMutation, useQueryClient } from "@tanstack/react-query";

import { tableService } from "@/services/tables.service";

type Params = {
  organizationId: string;
  branchId: string;
};

export function useArchiveTable({ organizationId, branchId }: Params) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tableId: string) =>
      tableService.archiveTable(organizationId, branchId, tableId),

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
