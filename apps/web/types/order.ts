export type PublicOrderType = "DINE_IN" | "TAKEOUT";

export type PublicOrderItemPayload = {
  productId: string;
  quantity: number;
};

export type CreatePublicOrderPayload = {
  orderType: PublicOrderType;
  tableId?: string;
  qrToken?: string;
  items: PublicOrderItemPayload[];
  notes?: string;
};

export type PublicOrderResponse = {
  publicToken: string;
  orderNumber: string;
  orderType: PublicOrderType;
  status: string;
  paymentStatus: string;
  currency: string;
  subtotal: string;
  total: string;
  table: {
    name: string;
    capacity: number;
    location: string | null;
  } | null;
  items: {
    productName: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }[];
  branch: {
    name: string;
    organization: {
      name: string;
    };
  };
};

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export type OrderType = "DINE_IN" | "TAKEOUT";

export type PaymentMethod = "CASH" | "GCASH" | "CARD" | "OTHER";

export type OrderTable = {
  id: string;
  name: string;
  capacity: number;
  status: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;

  currency: string;

  subtotal: string;
  discount: string;
  tax: string;
  total: string;

  createdAt: string;
  updatedAt: string;

  table: OrderTable | null;
  items: OrderItem[];
};

export type UpdateOrderStatusPayload = {
  status: OrderStatus;
};

export type RecordPaymentPayload = {
  paymentMethod: PaymentMethod;
  amountReceived: number;
};

export type RecordPaymentResponse = {
  order: Order;
  payment: {
    id: string;
    method: PaymentMethod;
    amount: string;
    amountReceived: string;
    changeAmount: string;
    currency: string;
  };
};
