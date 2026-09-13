import { MembershipRole } from '@prisma/client';

export interface AuthContext {
  userId: string;
  email: string;
  organizationId: string;
  branchId: string | null;
  membershipId: string;
  role: MembershipRole;
}