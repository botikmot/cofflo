import { apiFetch } from "@/lib/api";
import type { AuthMeResponse } from "@/types/auth";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    status: string;
  };
  memberships: AuthMeResponse["memberships"];
};

export type SelectContextPayload = {
  organizationId: string;
  branchId: string;
};

export type SelectContextResponse = {
  accessToken: string;
  context: {
    membershipId: string;
    organizationId: string;
    branchId: string;
    role: string;
  };
  organization: {
    id: string;
    name: string;
    tagline: string;
    slug: string;
    status: string;
  };
  branch: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
};

export type OnboardOrganizationPayload = {
  organizationName: string;
  branchName: string;
  currency: string;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
};

export type OnboardOrganizationResponse = {
  accessToken: string;

  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    status: string;
  };

  organization: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };

  branch: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };

  membership: {
    id: string;
    role: string;
  };
};

export async function login(payload: LoginPayload) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function selectContext(payload: SelectContextPayload) {
  return apiFetch<SelectContextResponse>("/auth/context", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function onboardOrganization(payload: OnboardOrganizationPayload) {
  return apiFetch<OnboardOrganizationResponse>("/organizations/onboard", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return apiFetch<AuthMeResponse>("/auth/me");
}
