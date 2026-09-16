import { useMutation, useQueryClient } from "@tanstack/react-query";

import { inventoryService } from "@/services/inventory.service";
import type { UpdateInventoryItemPayload } from "@/types/inventory";

export function useUpdateInventoryItem(
  organizationId?: string,
  branchId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      inventoryItemId,
      payload,
    }: {
      inventoryItemId: string;
      payload: UpdateInventoryItemPayload;
    }) =>
      inventoryService.updateItem(
        organizationId!,
        branchId!,
        inventoryItemId,
        payload,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inventory-items", organizationId, branchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["inventory-low-stock", organizationId, branchId],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "inventory-item",
          organizationId,
          branchId,
          variables.inventoryItemId,
        ],
      });
    },
  });
}
