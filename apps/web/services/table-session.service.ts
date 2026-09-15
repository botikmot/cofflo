import { apiFetch } from "@/lib/api";

export type TableSessionOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  currency: string;
  createdAt: string;

  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }[];

  payments: {
    id: string;
    method: string;
    amount: string;
    amountReceived: string;
    changeAmount: string;
    currency: string;
    createdAt: string;
  }[];
};

export type TableSession = {
  id: string;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt: string | null;

  table: {
    id: string;
    name: string;
    capacity: number;
    status: string;
  };

  orders: TableSessionOrder[];
};

export const tableSessionService = {
  getSession(organizationId: string, branchId: string, sessionId: string) {
    return apiFetch<TableSession>(
      `/organizations/${organizationId}/branches/${branchId}/tables/session/${sessionId}`,
    );
  },

  getActiveSession(organizationId: string, branchId: string, tableId: string) {
    return apiFetch<TableSession | null>(
      `/organizations/${organizationId}/branches/${branchId}/tables/${tableId}/session`,
    );
  },

  closeSession(
    organizationId: string,
    branchId: string,
    tableId: string,
    sessionId: string,
  ) {
    return apiFetch<TableSession>(
      `/organizations/${organizationId}/branches/${branchId}/tables/${tableId}/session/${sessionId}/close`,
      {
        method: "POST",
      },
    );
  },

  openSession(organizationId: string, branchId: string, tableId: string) {
    return apiFetch<TableSession>(
      `/organizations/${organizationId}/branches/${branchId}/tables/${tableId}/session`,
      {
        method: "POST",
      },
    );
  },
};
