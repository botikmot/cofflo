import { useQuery } from "@tanstack/react-query";

import { inventoryService } from "@/services/inventory.service";

export function useInventoryLowStock(
  organizationId?: string,
  branchId?: string,
) {
  return useQuery({
    queryKey: ["inventory-low-stock", organizationId, branchId],

    queryFn: () => inventoryService.getLowStock(organizationId!, branchId!),

    enabled: Boolean(organizationId && branchId),
  });
}
