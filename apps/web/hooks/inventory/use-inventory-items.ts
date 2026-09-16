import { useQuery } from "@tanstack/react-query";

import { inventoryService } from "@/services/inventory.service";

export function useInventoryItems(organizationId?: string, branchId?: string) {
  return useQuery({
    queryKey: ["inventory-items", organizationId, branchId],

    queryFn: () => inventoryService.getItems(organizationId!, branchId!),

    enabled: Boolean(organizationId && branchId),
  });
}
