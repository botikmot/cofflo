import { useMutation, useQueryClient } from "@tanstack/react-query";

import { inventoryService } from "@/services/inventory.service";
import type { CreateInventoryMovementPayload } from "@/types/inventory";

export function useCreateInventoryMovement(
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
      payload: CreateInventoryMovementPayload;
    }) =>
      inventoryService.createMovement(
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
          "inventory-movements",
          organizationId,
          branchId,
          variables.inventoryItemId,
        ],
      });
    },
  });
}
