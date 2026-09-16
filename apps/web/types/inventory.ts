export type InventoryMovementType = "IN" | "OUT" | "ADJUSTMENT" | "WASTE";

export type InventoryItem = {
  id: string;
  organizationId: string;
  branchId: string;

  name: string;
  sku: string | null;
  unit: string;
  currentStock: number;
  minimumStock: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

export type InventoryMovement = {
  id: string;
  inventoryItemId: string;
  organizationId: string;
  branchId: string;
  createdById: string;

  type: InventoryMovementType;
  quantity: number;
  reason: string | null;
  reference: string | null;

  createdAt: string;
};

export type CreateInventoryItemPayload = {
  name: string;
  sku?: string;
  unit: string;
  minimumStock?: number;
  initialStock?: number;
};

export type UpdateInventoryItemPayload = {
  name?: string;
  sku?: string;
  unit?: string;
  minimumStock?: number;
};

export type CreateInventoryMovementPayload = {
  type: InventoryMovementType;
  quantity: number;
  reason?: string;
  reference?: string;
};

export type InventoryMovementResult = {
  item: InventoryItem;
  movement: InventoryMovement;
};

export type InventoryItemFilters = {
  search?: string;
  showInactive?: boolean;
};
