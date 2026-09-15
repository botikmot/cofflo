import { apiFetch } from "@/lib/api";
import type { DashboardTable } from "@/types/dashboard";

export type CreateTablePayload = {
  name: string;
  capacity: number;
  location?: string;
  photoUrl?: string;
  customerSelectable?: boolean;
};

export type UpdateTablePayload = Partial<CreateTablePayload>;

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "UNAVAILABLE";

export const tableService = {
  getTables(organizationId: string, branchId: string) {
    return apiFetch<DashboardTable[]>(
      `/organizations/${organizationId}/branches/${branchId}/tables`,
    );
  },

  createTable(
    organizationId: string,
    branchId: string,
    payload: CreateTablePayload,
  ) {
    return apiFetch(
      `/organizations/${organizationId}/branches/${branchId}/tables`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  updateTable(
    organizationId: string,
    branchId: string,
    tableId: string,
    payload: UpdateTablePayload,
  ) {
    return apiFetch(
      `/organizations/${organizationId}/branches/${branchId}/tables/${tableId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  },

  updateTableStatus(
    organizationId: string,
    branchId: string,
    tableId: string,
    status: TableStatus,
  ) {
    return apiFetch(
      `/organizations/${organizationId}/branches/${branchId}/tables/${tableId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      },
    );
  },

  archiveTable(organizationId: string, branchId: string, tableId: string) {
    return apiFetch(
      `/organizations/${organizationId}/branches/${branchId}/tables/${tableId}`,
      {
        method: "DELETE",
      },
    );
  },
};
