import { useMutation, useQueryClient } from "@tanstack/react-query";

import { inventoryService } from "@/services/inventory.service";

export function useArchiveInventoryItem(
  organizationId?: string,
  branchId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inventoryItemId: string) =>
      inventoryService.archiveItem(organizationId!, branchId!, inventoryItemId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["inventory-items", organizationId, branchId],
      });
    },
  });
}
