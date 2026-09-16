import { apiFetch } from "@/lib/api";

import type {
  CreateInventoryItemPayload,
  CreateInventoryMovementPayload,
  InventoryItem,
  InventoryMovement,
  InventoryMovementResult,
  UpdateInventoryItemPayload,
} from "@/types/inventory";

function basePath(organizationId: string, branchId: string) {
  return `/organizations/${organizationId}/branches/${branchId}/inventory`;
}

function normalizeInventoryItem(item: InventoryItem): InventoryItem {
  return {
    ...item,
    currentStock: Number(item.currentStock),
    minimumStock: Number(item.minimumStock),
  };
}

export const inventoryService = {
  async getItems(organizationId: string, branchId: string) {
    const items = await apiFetch<InventoryItem[]>(
      basePath(organizationId, branchId),
    );

    return items.map(normalizeInventoryItem);
  },

  getLowStock(organizationId: string, branchId: string) {
    return apiFetch<InventoryItem[]>(
      `${basePath(organizationId, branchId)}/low-stock`,
    );
  },

  getItem(organizationId: string, branchId: string, inventoryItemId: string) {
    return apiFetch<InventoryItem>(
      `${basePath(organizationId, branchId)}/${inventoryItemId}`,
    );
  },

  createItem(
    organizationId: string,
    branchId: string,
    payload: CreateInventoryItemPayload,
  ) {
    return apiFetch<InventoryItem>(basePath(organizationId, branchId), {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateItem(
    organizationId: string,
    branchId: string,
    inventoryItemId: string,
    payload: UpdateInventoryItemPayload,
  ) {
    return apiFetch<InventoryItem>(
      `${basePath(organizationId, branchId)}/${inventoryItemId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  },

  archiveItem(
    organizationId: string,
    branchId: string,
    inventoryItemId: string,
  ) {
    return apiFetch<InventoryItem>(
      `${basePath(organizationId, branchId)}/${inventoryItemId}`,
      {
        method: "DELETE",
      },
    );
  },

  restoreItem(
    organizationId: string,
    branchId: string,
    inventoryItemId: string,
  ) {
    return apiFetch<InventoryItem>(
      `${basePath(organizationId, branchId)}/${inventoryItemId}/restore`,
      {
        method: "POST",
      },
    );
  },

  createMovement(
    organizationId: string,
    branchId: string,
    inventoryItemId: string,
    payload: CreateInventoryMovementPayload,
  ) {
    return apiFetch<InventoryMovementResult>(
      `${basePath(organizationId, branchId)}/${inventoryItemId}/movements`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  getMovements(
    organizationId: string,
    branchId: string,
    inventoryItemId: string,
  ) {
    return apiFetch<InventoryMovement[]>(
      `${basePath(organizationId, branchId)}/${inventoryItemId}/movements`,
    );
  },
};
