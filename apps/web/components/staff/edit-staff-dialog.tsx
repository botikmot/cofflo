"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";

import { useUpdateMembership } from "@/hooks/staff/use-update-membership";
import {
  MEMBERSHIP_ROLE_LABELS,
  type MembershipRole,
  type StaffMember,
} from "@/types/staff";

type EditStaffDialogProps = {
  open: boolean;
  organizationId: string;
  staff: StaffMember | null;
  onClose: () => void;
};

const editableRoles: MembershipRole[] = ["OWNER", "ADMIN", "MANAGER", "STAFF"];

export function EditStaffDialog({
  open,
  organizationId,
  staff,
  onClose,
}: EditStaffDialogProps) {
  const [role, setRole] = useState<MembershipRole>(staff?.role ?? "STAFF");

  const updateMembership = useUpdateMembership({
    organizationId,
  });

  if (!open || !staff) {
    return null;
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await updateMembership.mutateAsync({
        membershipId: staff.id,
        payload: {
          role,
        },
      });

      onClose();
    } catch {
      // Error rendered below.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2118]/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_25px_70px_rgba(43,33,24,0.18)]">
        <div className="flex items-start justify-between border-b border-[#E9E0D7] px-6 py-5">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0E7DF] text-[#6F4E37]">
              <Pencil className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-[#2B2118]">
              Edit staff
            </h2>

            <p className="mt-1 text-sm text-[#85786C]">
              {staff.user.firstName} {staff.user.lastName ?? ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updateMembership.isPending}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8A7D72] hover:bg-[#F4ECE4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 px-6 py-6">
          <div className="rounded-xl border border-[#E6DCD3] bg-[#FAF6F1] p-4">
            <p className="text-sm font-semibold text-[#3E342D]">
              {staff.user.email}
            </p>

            <p className="mt-1 text-xs text-[#8A7D72]">
              {staff.branch?.name ?? "Organization-wide"}
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="staff-role"
              className="text-sm font-medium text-[#3E342D]"
            >
              Role
            </label>

            <select
              id="staff-role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as MembershipRole)
              }
              className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3.5 text-sm text-[#2B2118] outline-none focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
            >
              {editableRoles.map((item) => (
                <option key={item} value={item}>
                  {MEMBERSHIP_ROLE_LABELS[item]}
                </option>
              ))}
            </select>
          </div>

          {updateMembership.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                {updateMembership.error instanceof Error
                  ? updateMembership.error.message
                  : "Unable to update staff membership."}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMembership.isPending}
              className="h-11 rounded-xl border border-[#DCCFC1] px-4 text-sm font-medium text-[#6F4E37]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateMembership.isPending}
              className="h-11 rounded-xl bg-[#6F4E37] px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {updateMembership.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
