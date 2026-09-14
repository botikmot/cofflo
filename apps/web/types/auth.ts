export type Organization = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export type Branch = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type Membership = {
  id: string;
  userId: string;
  organizationId: string;
  branchId: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  organization: Organization;
  branch: Branch | null;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  memberships: Membership[];
};

export type LoginResponse = {
  accessToken: string;
  user?: AuthUser;
};

export type MeResponse = AuthUser;

