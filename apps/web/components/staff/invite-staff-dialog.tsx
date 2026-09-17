"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";

import { useCreateInvitation } from "@/hooks/staff/use-create-invitation";
import { MEMBERSHIP_ROLE_LABELS, type MembershipRole } from "@/types/staff";

type InviteStaffDialogProps = {
  open: boolean;
  organizationId: string;
  branchId?: string;
  branchName?: string;
  onClose: () => void;
};

const inviteRoles: MembershipRole[] = ["ADMIN", "MANAGER", "STAFF"];

export function InviteStaffDialog({
  open,
  organizationId,
  branchId,
  branchName,
  onClose,
}: InviteStaffDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MembershipRole>("STAFF");

  const createInvitation = useCreateInvitation(organizationId);

  if (!open) {
    return null;
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || createInvitation.isPending) {
      return;
    }

    try {
      await createInvitation.mutateAsync({
        email: trimmedEmail,
        role,
        branchId,
      });

      setEmail("");
      setRole("STAFF");
      onClose();
    } catch {
      // Error rendered below.
    }
  };

  const handleClose = () => {
    if (createInvitation.isPending) {
      return;
    }

    setEmail("");
    setRole("STAFF");
    createInvitation.reset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2118]/35 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_25px_70px_rgba(43,33,24,0.18)]">
        <div className="flex items-start justify-between border-b border-[#E9E0D7] px-6 py-5">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0E7DF] text-[#6F4E37]">
              <Mail className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-[#2B2118]">
              Invite staff
            </h2>

            <p className="mt-1 text-sm leading-5 text-[#85786C]">
              Send an invitation to join your team.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={createInvitation.isPending}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8A7D72] transition hover:bg-[#F4ECE4] hover:text-[#2B2118] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label
              htmlFor="invite-email"
              className="text-sm font-medium text-[#3E342D]"
            >
              Email
            </label>

            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="staff@example.com"
              required
              className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3.5 text-sm text-[#2B2118] outline-none placeholder:text-[#A99A8D] focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="invite-role"
              className="text-sm font-medium text-[#3E342D]"
            >
              Role
            </label>

            <select
              id="invite-role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as MembershipRole)
              }
              className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3.5 text-sm text-[#2B2118] outline-none focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
            >
              {inviteRoles.map((item) => (
                <option key={item} value={item}>
                  {MEMBERSHIP_ROLE_LABELS[item]}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-[#E6DCD3] bg-[#FAF6F1] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8F8175]">
              Branch
            </p>

            <p className="mt-1 text-sm font-medium text-[#4B3E34]">
              {branchName ?? "Current branch"}
            </p>
          </div>

          {createInvitation.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                {createInvitation.error instanceof Error
                  ? createInvitation.error.message
                  : "Unable to send invitation."}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={createInvitation.isPending}
              className="h-11 rounded-xl border border-[#DCCFC1] px-4 text-sm font-medium text-[#6F4E37] hover:bg-[#F7F1EB] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createInvitation.isPending || !email.trim()}
              className="h-11 rounded-xl bg-[#6F4E37] px-5 text-sm font-semibold text-white transition hover:bg-[#5E402E] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createInvitation.isPending ? "Sending..." : "Send invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
