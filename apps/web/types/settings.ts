export type OrganizationSettings = {
  id: string;
  name: string;
  slug: string;
  status: string;
  currency: string;

  logoUrl: string | null;
  tagline: string | null;
  description: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;

  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;

  createdAt?: string;
  updatedAt?: string;
};

export type BranchSettings = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;

  phone: string | null;
  email: string | null;
  address: string | null;
  timezone: string;

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type UpdateOrganizationSettingsPayload = {
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  currency?: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
};

export type UpdateBranchSettingsPayload = {
  name: string;
  slug: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  timezone?: string;
};

export type CreateBranchPayload = {
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  timezone?: string;
};
