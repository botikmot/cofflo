import { useQuery } from "@tanstack/react-query";

import { inventoryService } from "@/services/inventory.service";

export function useInventoryMovements(
  organizationId?: string,
  branchId?: string,
  inventoryItemId?: string,
) {
  return useQuery({
    queryKey: [
      "inventory-movements",
      organizationId,
      branchId,
      inventoryItemId,
    ],

    queryFn: () =>
      inventoryService.getMovements(
        organizationId!,
        branchId!,
        inventoryItemId!,
      ),

    enabled: Boolean(organizationId && branchId && inventoryItemId),
  });
}
