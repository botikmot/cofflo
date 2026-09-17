import { apiFetch } from "@/lib/api";

import type { ReportsResponse } from "@/types/reports";

type GetReportParams = {
  organizationId: string;
  branchId?: string;
  from: string;
  to: string;
};

export const reportsService = {
  getReport({ organizationId, branchId, from, to }: GetReportParams) {
    const searchParams = new URLSearchParams();

    if (branchId) {
      searchParams.set("branchId", branchId);
    }

    searchParams.set("from", from);
    searchParams.set("to", to);

    return apiFetch<ReportsResponse>(
      `/organizations/${organizationId}/reports?${searchParams.toString()}`,
    );
  },
};
