import { useMutation, useQueryClient } from "@tanstack/react-query";

import { inventoryService } from "@/services/inventory.service";

export function useRestoreInventoryItem(
  organizationId?: string,
  branchId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inventoryItemId: string) =>
      inventoryService.restoreItem(organizationId!, branchId!, inventoryItemId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["inventory-items", organizationId, branchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["inventory-low-stock", organizationId, branchId],
      });
    },
  });
}
