import { apiFetch } from "@/lib/api";
import type { BranchSettings, CreateBranchPayload } from "@/types/settings";

export async function getBranches(organizationId: string) {
  return apiFetch<BranchSettings[]>(
    `/organizations/${organizationId}/branches`,
  );
}

export async function createBranch(
  organizationId: string,
  payload: CreateBranchPayload,
) {
  return apiFetch<BranchSettings>(`/organizations/${organizationId}/branches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function removeBranch(organizationId: string, branchId: string) {
  return apiFetch<{
    message: string;
    branchId: string;
  }>(`/organizations/${organizationId}/branches/${branchId}`, {
    method: "DELETE",
  });
}
