export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  status: string;
}
