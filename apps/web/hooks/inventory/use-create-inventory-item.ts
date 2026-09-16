import { useMutation, useQueryClient } from "@tanstack/react-query";

import { inventoryService } from "@/services/inventory.service";
import type { CreateInventoryItemPayload } from "@/types/inventory";

export function useCreateInventoryItem(
  organizationId?: string,
  branchId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInventoryItemPayload) =>
      inventoryService.createItem(organizationId!, branchId!, payload),

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
