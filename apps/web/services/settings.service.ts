import { apiFetch } from "@/lib/api";

import type {
  BranchSettings,
  OrganizationSettings,
  CreateBranchPayload,
  UpdateBranchSettingsPayload,
  UpdateOrganizationSettingsPayload,
} from "@/types/settings";

export async function getOrganizationSettings(organizationId: string) {
  return apiFetch<OrganizationSettings>(
    `/settings/organizations/${organizationId}`,
  );
}

export async function updateOrganizationSettings(
  organizationId: string,
  payload: UpdateOrganizationSettingsPayload,
) {
  return apiFetch<OrganizationSettings>(
    `/settings/organizations/${organizationId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function getBranchSettings(
  organizationId: string,
  branchId: string,
) {
  return apiFetch<BranchSettings>(
    `/settings/organizations/${organizationId}/branches/${branchId}`,
  );
}

export async function updateBranchSettings(
  organizationId: string,
  branchId: string,
  payload: UpdateBranchSettingsPayload,
) {
  return apiFetch<BranchSettings>(
    `/settings/organizations/${organizationId}/branches/${branchId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function removeBranch(organizationId: string, branchId: string) {
  return apiFetch<{
    message: string;
    branchId: string;
  }>(`/organizations/${organizationId}/branches/${branchId}`, {
    method: "DELETE",
  });
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
