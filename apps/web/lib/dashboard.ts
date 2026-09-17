import type { DashboardOrder, DashboardTable } from "@/types/dashboard";
import type { Order } from "@/types/order";

function normalizeOrders(value: unknown): Order[] {
  if (Array.isArray(value)) {
    return value as Order[];
  }

  if (value && typeof value === "object") {
    const objectValue = value as {
      data?: unknown;
      orders?: unknown;
    };

    // { data: Order[] }
    if (Array.isArray(objectValue.data)) {
      return objectValue.data as Order[];
    }

    // { orders: Order[] }
    if (Array.isArray(objectValue.orders)) {
      return objectValue.orders as Order[];
    }

    // Handle nested response:
    // { data: { data: Order[] } }
    if (objectValue.data && typeof objectValue.data === "object") {
      return normalizeOrders(objectValue.data);
    }
  }

  return [];
}

export function getTodayBounds() {
  const now = new Date();
  const start = new Date(now);

  start.setHours(0, 0, 0, 0);

  return {
    start,
    end: now,
  };
}

export function getTodayOrders(orders: Order[]) {
  const { start, end } = getTodayBounds();

  return orders.filter((order) => {
    const createdAt = new Date(order.createdAt);

    return createdAt >= start && createdAt <= end;
  });
}

export function calculateTodaySales(value: unknown) {
  const orders = normalizeOrders(value);

  const { start, end } = getTodayBounds();

  return orders
    .filter((order) => {
      const createdAt = new Date(order.createdAt);

      return createdAt >= start && createdAt <= end;
    })
    .reduce((total, order) => total + Number(order.total), 0);
}

export function calculateOccupiedTables(tables: DashboardTable[]) {
  const activeTables = tables.filter((table) => table.isActive);

  const occupied = activeTables.filter(
    (table) => table.status === "OCCUPIED",
  ).length;

  return {
    occupied,
    total: activeTables.length,
  };
}

export function getRecentOrders(orders: DashboardOrder[], limit = 5) {
  return [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}

export function getOrderStatusCounts(orders: DashboardOrder[]) {
  const counts = {
    PENDING: 0,
    CONFIRMED: 0,
    PREPARING: 0,
    READY: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  for (const order of orders) {
    if (order.status in counts) {
      counts[order.status as keyof typeof counts]++;
    }
  }

  return counts;
}
