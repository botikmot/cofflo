export type ReportSummary = {
  sales: number;
  orders: number;
  paidOrders: number;
  unpaidOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
};

export type SalesTrendPoint = {
  date: string;
  sales: number;
  orders: number;
};

export type OrderBreakdownItem = {
  type: "DINE_IN" | "TAKEOUT";
  count: number;
  sales: number;
};

export type PaymentBreakdownItem = {
  method: "CASH" | "GCASH" | "CARD" | "OTHER";
  count: number;
  amount: number;
};

export type TopProductReport = {
  productId: string;
  productName: string;
  quantity: number;
  sales: number;
};

export type InventoryAlertItem = {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  currentStock: number;
  minimumStock: number;
};

export type ReportInventory = {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockItems: InventoryAlertItem[];
  outOfStockItems: InventoryAlertItem[];
};

export type ReservationReport = {
  total: number;
  pending: number;
  confirmed: number;
  seated: number;
  completed: number;
  cancelled: number;
  noShow: number;
};

export type QueueReport = {
  total: number;
  waiting: number;
  called: number;
  seated: number;
  cancelled: number;
  noShow: number;
};

export type ReportsResponse = {
  organization: {
    id: string;
    name: string;
    currency: string;
  };

  filters: {
    branchId: string | null;
    from: string;
    to: string;
  };

  summary: ReportSummary;

  salesTrend: SalesTrendPoint[];

  orderBreakdown: OrderBreakdownItem[];

  paymentBreakdown: PaymentBreakdownItem[];

  topProducts: TopProductReport[];

  inventory: ReportInventory;

  reservations: ReservationReport;

  queue: QueueReport;
};
