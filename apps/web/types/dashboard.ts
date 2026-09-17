export type DashboardOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string | number;
  currency: string;
  orderType: string;
  createdAt: string;
  table?: {
    id: string;
    name: string;
    status: string;
  } | null;
};

export type DashboardTable = {
  id: string;
  name: string;
  capacity: number;
  location: string | null;
  photoUrl: string | null;
  qrToken: string;
  customerSelectable: boolean;
  status: "AVAILABLE" | "OCCUPIED" | "UNAVAILABLE";
  isActive: boolean;

  activeSession: {
    id: string;
    openedAt: string;
    orderCount: number;
    total: number;
    outstandingTotal: number;
  } | null;
};

export type DashboardData = {
  orders: DashboardOrder[];
  tables: DashboardTable[];
};
