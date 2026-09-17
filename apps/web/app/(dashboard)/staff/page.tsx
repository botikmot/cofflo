"use client";

import { useMemo, useState } from "react";
import {
  Mail,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

import { CoffeeLoading } from "@/components/ui/coffee-loading";
import { EditStaffDialog } from "@/components/staff/edit-staff-dialog";
import { InviteStaffDialog } from "@/components/staff/invite-staff-dialog";

import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useCancelInvitation } from "@/hooks/staff/use-cancel-invitation";
import { useInvitations } from "@/hooks/staff/use-invitations";
import { useRemoveMember } from "@/hooks/staff/use-remove-member";
import { useResendInvitation } from "@/hooks/staff/use-resend-invitation";
import { useStaff } from "@/hooks/staff/use-staff";
import {
  MEMBERSHIP_ROLE_LABELS,
  type MembershipRole,
  type StaffMember,
} from "@/types/staff";

type StaffTab = "STAFF" | "INVITATIONS";

type RoleFilter = "ALL" | MembershipRole;

const ROLE_FILTERS: RoleFilter[] = [
  "ALL",
  "OWNER",
  "ADMIN",
  "MANAGER",
  "STAFF",
];

function getFullName(member: StaffMember) {
  const name = [member.user.firstName, member.user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || member.user.email;
}

function getInitials(member: StaffMember) {
  const first = member.user.firstName?.charAt(0) ?? "";
  const last = member.user.lastName?.charAt(0) ?? "";

  const initials = `${first}${last}`.toUpperCase();

  return initials || "?";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatInvitationStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "ACCEPTED":
      return "Accepted";

    case "EXPIRED":
      return "Expired";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

function getUserStatusClass(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-[#E4F0E6] text-[#41674A]";

    case "SUSPENDED":
      return "bg-[#F8EAD5] text-[#886121]";

    case "DEACTIVATED":
      return "bg-[#EEE8E3] text-[#74675D]";

    default:
      return "bg-[#EEE8E3] text-[#74675D]";
  }
}

function getInvitationStatusClass(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-[#F4E9D7] text-[#805E22]";

    case "ACCEPTED":
      return "bg-[#E4F0E6] text-[#41674A]";

    case "EXPIRED":
      return "bg-[#EEE8E3] text-[#74675D]";

    case "CANCELLED":
      return "bg-[#F8E3E0] text-[#97483F]";

    default:
      return "bg-[#EEE8E3] text-[#74675D]";
  }
}

export default function StaffPage() {
  const {
    user,
    activeMembership,
    isLoading: workspaceLoading,
  } = useWorkspace();

  const organizationId = activeMembership?.organization?.id;
  const branchId = activeMembership?.branch?.id;
  const branchName = activeMembership?.branch?.name;

  const currentRole = activeMembership?.role;

  const canManageStaff = currentRole === "OWNER" || currentRole === "ADMIN";

  const [activeTab, setActiveTab] = useState<StaffTab>("STAFF");

  const [invitationView, setInvitationView] = useState<"ACTIVE" | "HISTORY">(
    "ACTIVE",
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const staffQuery = useStaff(organizationId);
  const invitationsQuery = useInvitations(organizationId);

  const removeMember = useRemoveMember({
    organizationId: organizationId ?? "",
  });

  const resendInvitation = useResendInvitation(organizationId ?? "");

  const cancelInvitation = useCancelInvitation(organizationId ?? "");

  const staff = staffQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];

  const visibleInvitations = useMemo(() => {
    if (invitationView === "ACTIVE") {
      return invitations.filter(
        (invitation) =>
          invitation.status === "PENDING" || invitation.status === "ACCEPTED",
      );
    }

    return invitations.filter(
      (invitation) =>
        invitation.status === "EXPIRED" || invitation.status === "CANCELLED",
    );
  }, [invitationView, invitations]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((member) => {
      const fullName = getFullName(member).toLowerCase();
      const email = member.user.email.toLowerCase();

      const matchesSearch =
        !query || fullName.includes(query) || email.includes(query);

      const matchesRole = roleFilter === "ALL" || member.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [roleFilter, search, staff]);

  const pendingInvitationCount = invitations.filter(
    (invitation) => invitation.status === "PENDING",
  ).length;

  const pageError = staffQuery.error ?? invitationsQuery.error;

  const hasMutationError =
    removeMember.isError ||
    resendInvitation.isError ||
    cancelInvitation.isError;

  const mutationError =
    removeMember.error ?? resendInvitation.error ?? cancelInvitation.error;

  if (workspaceLoading || staffQuery.isLoading || invitationsQuery.isLoading) {
    return (
      <div className="pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  if (!organizationId || !user) {
    return (
      <div className="space-y-5 pt-4">
        <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
          <Users className="mx-auto h-7 w-7 text-[#B7A99B]" />

          <p className="mt-3 text-sm font-semibold text-[#5E5248]">
            We couldn&apos;t load your staff workspace.
          </p>

          <p className="mt-1 text-sm text-[#94877A]">
            Please refresh and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pt-4 pb-10">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9A8C80]">
              Team
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#2B2118]">
              Staff
            </h1>

            <p className="mt-1 text-sm text-[#85786C]">
              Manage your team and their access.
            </p>
          </div>

          {canManageStaff && (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#5E402E]"
            >
              <UserPlus className="h-4 w-4" />
              Invite staff
            </button>
          )}
        </div>

        {/* API ERROR */}
        {pageError instanceof Error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              {pageError.message}
            </p>
          </div>
        )}

        {/* MUTATION ERROR */}
        {hasMutationError && mutationError instanceof Error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              {mutationError.message}
            </p>
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-2 border-b border-[#E7DCCE]">
          <button
            type="button"
            onClick={() => setActiveTab("STAFF")}
            className={[
              "border-b-2 px-4 py-3 text-sm font-semibold transition",
              activeTab === "STAFF"
                ? "border-[#6F4E37] text-[#6F4E37]"
                : "border-transparent text-[#8C7E73] hover:text-[#4F4339]",
            ].join(" ")}
          >
            Staff
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("INVITATIONS")}
            className={[
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition",
              activeTab === "INVITATIONS"
                ? "border-[#6F4E37] text-[#6F4E37]"
                : "border-transparent text-[#8C7E73] hover:text-[#4F4339]",
            ].join(" ")}
          >
            Invitations
            {pendingInvitationCount > 0 && (
              <span className="rounded-full bg-[#F0E6DA] px-2 py-0.5 text-[10px] font-semibold text-[#6F4E37]">
                {pendingInvitationCount}
              </span>
            )}
          </button>
        </div>

        {/* STAFF TAB */}
        {activeTab === "STAFF" && (
          <>
            {/* FILTER BAR */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#988A7E]" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search staff..."
                  className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] pl-9 pr-4 text-sm text-[#2B2118] outline-none placeholder:text-[#A99A8D] transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value as RoleFilter)
                }
                className="h-11 rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3.5 text-sm text-[#2B2118] outline-none transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
              >
                {ROLE_FILTERS.map((role) => (
                  <option key={role} value={role}>
                    {role === "ALL"
                      ? "All roles"
                      : MEMBERSHIP_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>

            {/* STAFF LIST */}
            {filteredStaff.length === 0 ? (
              <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] px-6 py-14 text-center">
                <Users className="mx-auto h-7 w-7 text-[#B7A99B]" />

                <p className="mt-3 text-sm font-semibold text-[#5E5248]">
                  No staff found
                </p>

                <p className="mt-1 text-sm text-[#94877A]">
                  {search || roleFilter !== "ALL"
                    ? "Try adjusting your search or role filter."
                    : "Invite your first staff member to get started."}
                </p>
              </div>
            ) : (
              <div className="overflow-visible rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9]">
                {/* DESKTOP HEADER */}
                <div className="hidden grid-cols-[1.8fr_1fr_1fr_0.8fr_48px] gap-4 border-b border-[#E7DCCE] bg-[#FAF6F1] px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#95877B] md:grid">
                  <span>Staff</span>
                  <span>Role</span>
                  <span>Branch</span>
                  <span>Status</span>
                  <span />
                </div>

                <div className="divide-y divide-[#EEE5DC]">
                  {filteredStaff.map((member) => {
                    const isCurrentUser = member.user.id === user.id;

                    return (
                      <div
                        key={member.id}
                        className="relative grid gap-4 px-5 py-4 transition-colors hover:bg-[#FFFCF8] md:grid-cols-[1.8fr_1fr_1fr_0.8fr_48px] md:items-center"
                      >
                        {/* PERSON */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE2D8] text-sm font-semibold text-[#6F4E37]">
                            {getInitials(member)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-[#2B2118]">
                                {getFullName(member)}
                              </p>

                              {isCurrentUser && (
                                <span className="shrink-0 rounded-full bg-[#F0E6DA] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#6F4E37]">
                                  You
                                </span>
                              )}
                            </div>

                            <p className="truncate text-xs text-[#8A7C71]">
                              {member.user.email}
                            </p>
                          </div>
                        </div>

                        {/* ROLE */}
                        <div>
                          <p className="mb-1 text-[11px] text-[#95877B] md:hidden">
                            Role
                          </p>

                          <span className="inline-flex rounded-full bg-[#F0E6DA] px-2.5 py-1 text-xs font-semibold text-[#6F4E37]">
                            {MEMBERSHIP_ROLE_LABELS[member.role]}
                          </span>
                        </div>

                        {/* BRANCH */}
                        <div>
                          <p className="mb-1 text-[11px] text-[#95877B] md:hidden">
                            Branch
                          </p>

                          <p className="text-sm font-medium text-[#554940]">
                            {member.branch?.name ?? "Organization-wide"}
                          </p>
                        </div>

                        {/* STATUS */}
                        <div>
                          <p className="mb-1 text-[11px] text-[#95877B] md:hidden">
                            Status
                          </p>

                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                              getUserStatusClass(member.user.status),
                            ].join(" ")}
                          >
                            {member.user.status === "ACTIVE"
                              ? "Active"
                              : member.user.status}
                          </span>
                        </div>

                        {/* MENU */}
                        <div className="relative flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId((current) =>
                                current === member.id ? null : member.id,
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#887B70] transition-colors hover:bg-[#F4ECE4] hover:text-[#6F4E37]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {openMenuId === member.id && (
                            <div className="absolute right-0 top-10 z-40 w-44 overflow-hidden rounded-2xl border border-[#E7DCCE] bg-[#FFFDF9] p-1.5 shadow-[0_15px_40px_rgba(43,33,24,0.12)]">
                              {canManageStaff && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingStaff(member);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#5C5047] transition hover:bg-[#F6EFE8]"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit role
                                </button>
                              )}

                              {canManageStaff && (
                                <button
                                  type="button"
                                  disabled={
                                    removeMember.isPending || isCurrentUser
                                  }
                                  onClick={async () => {
                                    setOpenMenuId(null);

                                    if (isCurrentUser) {
                                      return;
                                    }

                                    const confirmed = window.confirm(
                                      `Remove ${getFullName(member)} from this organization?`,
                                    );

                                    if (!confirmed) {
                                      return;
                                    }

                                    try {
                                      await removeMember.mutateAsync(member.id);
                                    } catch {
                                      // Error displayed above.
                                    }
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#9B604F] transition hover:bg-[#FBF0EB] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Remove staff
                                </button>
                              )}

                              {!canManageStaff && (
                                <div className="px-3 py-2.5 text-[11px] leading-4 text-[#9A8C80]">
                                  You have view-only access to staff management.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* INVITATIONS TAB */}
        {activeTab === "INVITATIONS" && (
          <div className="space-y-4">
            {/* INVITATION FILTER */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setInvitationView("ACTIVE")}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all",
                    invitationView === "ACTIVE"
                      ? "bg-[#6F4E37] text-white shadow-sm"
                      : "border border-[#E7DCCE] bg-[#FFFDF9] text-[#75685D] hover:bg-[#FAF6F1]",
                  ].join(" ")}
                >
                  Active
                  <span
                    className={[
                      "rounded-full px-1.5 py-0.5 text-[10px]",
                      invitationView === "ACTIVE"
                        ? "bg-white/15 text-white"
                        : "bg-[#F0E6DA] text-[#6F4E37]",
                    ].join(" ")}
                  >
                    {
                      invitations.filter(
                        (invitation) =>
                          invitation.status === "PENDING" ||
                          invitation.status === "ACCEPTED",
                      ).length
                    }
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInvitationView("HISTORY")}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all",
                    invitationView === "HISTORY"
                      ? "bg-[#6F4E37] text-white shadow-sm"
                      : "border border-[#E7DCCE] bg-[#FFFDF9] text-[#75685D] hover:bg-[#FAF6F1]",
                  ].join(" ")}
                >
                  History
                  <span
                    className={[
                      "rounded-full px-1.5 py-0.5 text-[10px]",
                      invitationView === "HISTORY"
                        ? "bg-white/15 text-white"
                        : "bg-[#F0E6DA] text-[#6F4E37]",
                    ].join(" ")}
                  >
                    {
                      invitations.filter(
                        (invitation) =>
                          invitation.status === "EXPIRED" ||
                          invitation.status === "CANCELLED",
                      ).length
                    }
                  </span>
                </button>
              </div>

              {canManageStaff && (
                <button
                  type="button"
                  onClick={() => setInviteOpen(true)}
                  className="hidden shrink-0 items-center gap-2 rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3.5 py-2.5 text-xs font-semibold text-[#6F4E37] transition hover:bg-[#F7F1EB] sm:inline-flex"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Invite
                </button>
              )}
            </div>

            {/* INVITATIONS LIST */}
            <div className="overflow-visible rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9]">
              {visibleInvitations.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  {invitationView === "ACTIVE" ? (
                    <Mail className="mx-auto h-7 w-7 text-[#B7A99B]" />
                  ) : (
                    <RefreshCw className="mx-auto h-7 w-7 text-[#B7A99B]" />
                  )}

                  <p className="mt-3 text-sm font-semibold text-[#5E5248]">
                    {invitationView === "ACTIVE"
                      ? "No active invitations"
                      : "No invitation history"}
                  </p>

                  <p className="mt-1 text-sm text-[#94877A]">
                    {invitationView === "ACTIVE"
                      ? "Pending and accepted invitations will appear here."
                      : "Cancelled and expired invitations will appear here."}
                  </p>

                  {invitationView === "ACTIVE" && canManageStaff && (
                    <button
                      type="button"
                      onClick={() => setInviteOpen(true)}
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white hover:bg-[#5E402E]"
                    >
                      <UserPlus className="h-4 w-4" />
                      Invite staff
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-[#EEE5DC]">
                  {visibleInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE2D8] text-[#6F4E37]">
                          <Mail className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#2B2118]">
                            {invitation.email}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#F0E6DA] px-2.5 py-1 text-[11px] font-semibold text-[#6F4E37]">
                              {MEMBERSHIP_ROLE_LABELS[invitation.role]}
                            </span>

                            <span
                              className={[
                                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                getInvitationStatusClass(invitation.status),
                              ].join(" ")}
                            >
                              {formatInvitationStatus(invitation.status)}
                            </span>
                          </div>

                          <p className="mt-2 text-xs text-[#8C7E73]">
                            {invitation.branch?.name ?? "Organization-wide"} ·
                            Created {formatDate(invitation.createdAt)}
                          </p>

                          {invitation.status === "PENDING" && (
                            <p className="mt-1 text-xs text-[#9A8C80]">
                              Expires {formatDate(invitation.expiresAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      {invitation.status === "PENDING" && canManageStaff && (
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            disabled={resendInvitation.isPending}
                            onClick={async () => {
                              try {
                                await resendInvitation.mutateAsync(
                                  invitation.id,
                                );
                              } catch {
                                // Error displayed above.
                              }
                            }}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#DCCFC1] px-3 text-xs font-semibold text-[#6F4E37] transition hover:bg-[#F7F1EB] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RefreshCw
                              className={[
                                "h-3.5 w-3.5",
                                resendInvitation.isPending
                                  ? "animate-spin"
                                  : "",
                              ].join(" ")}
                            />

                            {resendInvitation.isPending
                              ? "Resending..."
                              : "Resend"}
                          </button>

                          <button
                            type="button"
                            disabled={cancelInvitation.isPending}
                            onClick={async () => {
                              const confirmed = window.confirm(
                                `Cancel invitation for ${invitation.email}?`,
                              );

                              if (!confirmed) {
                                return;
                              }

                              try {
                                await cancelInvitation.mutateAsync(
                                  invitation.id,
                                );
                              } catch {
                                // Error displayed above.
                              }
                            }}
                            className="inline-flex h-9 items-center justify-center rounded-xl border border-[#EACAC4] px-3 text-xs font-semibold text-[#9B604F] transition hover:bg-[#FBF0EB] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancelInvitation.isPending
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        </div>
                      )}

                      {invitation.status === "PENDING" && !canManageStaff && (
                        <div className="text-xs text-[#9A8C80]">View only</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* INVITE MODAL */}
      {canManageStaff && (
        <InviteStaffDialog
          open={inviteOpen}
          organizationId={organizationId}
          branchId={branchId}
          branchName={branchName}
          onClose={() => setInviteOpen(false)}
        />
      )}

      {/* EDIT MODAL */}
      {canManageStaff && (
        <EditStaffDialog
          open={Boolean(editingStaff)}
          organizationId={organizationId}
          staff={editingStaff}
          onClose={() => setEditingStaff(null)}
        />
      )}
    </>
  );
}
