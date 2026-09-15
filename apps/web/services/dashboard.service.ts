import { apiFetch } from "@/lib/api";

import type {
  DashboardData,
  DashboardOrder,
  DashboardTable,
} from "@/types/dashboard";

export async function getDashboardData(
  organizationId: string,
  branchId: string,
): Promise<DashboardData> {
  const [orders, tables] = await Promise.all([
    apiFetch<DashboardOrder[]>(
      `/organizations/${organizationId}/branches/${branchId}/orders`,
    ),

    apiFetch<DashboardTable[]>(
      `/organizations/${organizationId}/branches/${branchId}/tables`,
    ),
  ]);

  return {
    orders,
    tables,
  };
}
