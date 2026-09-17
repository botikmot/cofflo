export type MembershipRole = "OWNER" | "ADMIN" | "MANAGER" | "STAFF";

export type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "DEACTIVATED";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

export type StaffMember = {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    status: UserStatus;
    createdAt: string;
  };
  organizationId: string;
  branchId: string | null;
  role: MembershipRole;
  branch: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type StaffInvitation = {
  id: string;
  organizationId: string;
  branchId: string | null;
  email: string;
  role: MembershipRole;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  branch: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type CreateInvitationPayload = {
  email: string;
  role?: MembershipRole;
  branchId?: string;
};

export type UpdateMembershipPayload = {
  role?: MembershipRole;
  branchId?: string | null;
};

export const MEMBERSHIP_ROLE_LABELS: Record<MembershipRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  STAFF: "Staff",
};
