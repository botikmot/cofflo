import { apiFetch } from "@/lib/api";
import type {
  CreateInvitationPayload,
  StaffInvitation,
  StaffMember,
  UpdateMembershipPayload,
} from "@/types/staff";

export const staffService = {
  getMembers(organizationId: string) {
    return apiFetch<StaffMember[]>(`/organizations/${organizationId}/members`);
  },

  updateMember(
    organizationId: string,
    membershipId: string,
    payload: UpdateMembershipPayload,
  ) {
    return apiFetch<StaffMember>(
      `/organizations/${organizationId}/members/${membershipId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  },

  removeMember(organizationId: string, membershipId: string) {
    return apiFetch<{ message: string }>(
      `/organizations/${organizationId}/members/${membershipId}`,
      {
        method: "DELETE",
      },
    );
  },

  getInvitations(organizationId: string) {
    return apiFetch<StaffInvitation[]>(
      `/organizations/${organizationId}/invitations`,
    );
  },

  createInvitation(organizationId: string, payload: CreateInvitationPayload) {
    return apiFetch<
      StaffInvitation & {
        token?: string;
        invitationUrl?: string;
      }
    >(`/organizations/${organizationId}/invitations`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  cancelInvitation(organizationId: string, invitationId: string) {
    return apiFetch<StaffInvitation>(
      `/organizations/${organizationId}/invitations/${invitationId}/cancel`,
      {
        method: "PATCH",
      },
    );
  },

  resendInvitation(organizationId: string, invitationId: string) {
    return apiFetch<
      StaffInvitation & {
        token?: string;
        invitationUrl?: string;
      }
    >(`/organizations/${organizationId}/invitations/${invitationId}/resend`, {
      method: "PATCH",
    });
  },
};
