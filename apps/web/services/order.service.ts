import { apiFetch } from "@/lib/api";

import type {
  CreatePublicOrderPayload,
  PublicOrderResponse,
  Order,
  RecordPaymentPayload,
  RecordPaymentResponse,
  UpdateOrderStatusPayload,
  OrderType,
  OrderStatus,
} from "@/types/order";

export type CreateOrderItemPayload = {
  productId: string;
  quantity: number;
};

export type CreateOrderPayload = {
  orderType: OrderType;
  tableId?: string;
  customerId?: string;
  discount?: number;
  tax?: number;
  items: CreateOrderItemPayload[];
  notes?: string;
};

export type GetOrdersParams = {
  page?: number;
  limit?: number;
  status?: "ALL" | OrderStatus;
  search?: string;
};

export type OrdersResponse = {
  data: Order[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const orderService = {
  createPublicOrder(branchId: string, payload: CreatePublicOrderPayload) {
    return apiFetch<PublicOrderResponse>(
      `/public/branches/${branchId}/orders`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  getPublicOrder(publicToken: string) {
    return apiFetch<PublicOrderResponse>(`/public/orders/${publicToken}`);
  },

  async getOrders(
    organizationId: string,
    branchId: string,
    params: GetOrdersParams = {},
  ): Promise<OrdersResponse> {
    const query = new URLSearchParams();

    query.set("page", String(params.page ?? 1));

    query.set("limit", String(params.limit ?? 20));

    if (params.status && params.status !== "ALL") {
      query.set("status", params.status);
    }

    if (params.search?.trim()) {
      query.set("search", params.search.trim());
    }

    return apiFetch<OrdersResponse>(
      `/organizations/${organizationId}/branches/${branchId}/orders?${query.toString()}`,
    );
  },

  getOrder(organizationId: string, branchId: string, orderId: string) {
    return apiFetch<Order>(
      `/organizations/${organizationId}/branches/${branchId}/orders/${orderId}`,
    );
  },

  updateStatus(
    organizationId: string,
    branchId: string,
    orderId: string,
    payload: UpdateOrderStatusPayload,
  ) {
    return apiFetch<Order>(
      `/organizations/${organizationId}/branches/${branchId}/orders/${orderId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  },

  recordPayment(
    organizationId: string,
    branchId: string,
    orderId: string,
    payload: RecordPaymentPayload,
  ) {
    return apiFetch<RecordPaymentResponse>(
      `/organizations/${organizationId}/branches/${branchId}/orders/${orderId}/payment`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  createOrder(
    organizationId: string,
    branchId: string,
    payload: CreateOrderPayload,
  ) {
    return apiFetch<Order>(
      `/organizations/${organizationId}/branches/${branchId}/orders`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },
};
