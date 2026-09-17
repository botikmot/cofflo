export type Organization = {
  id: string;
  name: string;
  tagline: string;
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
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  memberships: AuthMembership[];
};

export type LoginResponse = {
  accessToken: string;
  user?: AuthUser;
};

export type MeResponse = AuthUser;

export type AuthMembership = {
  id: string;
  userId: string;
  organizationId: string;
  branchId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
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

export type AuthMeResponse = AuthUser;
