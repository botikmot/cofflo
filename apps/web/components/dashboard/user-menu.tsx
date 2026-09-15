"use client";

import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/stores/workspace.store";

type UserMenuProps = {
  firstName?: string;
  lastName?: string;
  role?: string;
};

export function UserMenu({ firstName, lastName, role }: UserMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim() || "User";

  const initial = firstName?.charAt(0).toUpperCase() ?? "U";

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("activeMembershipId");

    useWorkspaceStore.getState().clearWorkspace();

    queryClient.clear();

    router.replace("/login");
  }

  return (
    <div className="group relative">
      <button
        type="button"
        className="
          flex items-center gap-2
          rounded-xl
          px-1.5 py-1.5
          transition-colors
          hover:bg-[#F4EEE7]
        "
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6F4E37] text-sm font-semibold text-white shadow-sm">
          {initial}
        </div>

        <div className="hidden text-left leading-tight xl:block">
          <p className="max-w-[100px] truncate text-xs font-semibold text-[#2B2118]">
            {fullName}
          </p>

          <p className="text-[10px] capitalize text-[#918579]">
            {role?.toLowerCase() ?? "staff"}
          </p>
        </div>

        <ChevronDown className="hidden h-3.5 w-3.5 text-[#8A7A6C] xl:block" />
      </button>

      <div
        className="
          invisible absolute right-0 top-full z-50 mt-2
          w-56 translate-y-1
          rounded-2xl
          border border-[#E8DED2]
          bg-[#FFFDF9]
          p-2
          opacity-0
          shadow-[0_18px_50px_rgba(70,45,25,0.14)]
          transition-all duration-150
          group-hover:visible
          group-hover:translate-y-0
          group-hover:opacity-100
        "
      >
        <div className="border-b border-[#EFE7DE] px-3 pb-3 pt-2">
          <p className="truncate text-sm font-semibold">{fullName}</p>

          <p className="mt-0.5 truncate text-xs text-[#918579]">
            {role ?? "Staff"}
          </p>
        </div>

        <div className="space-y-1 pt-2">
          <button
            type="button"
            className="
              flex w-full items-center gap-3
              rounded-xl px-3 py-2.5
              text-sm text-[#62574D]
              transition-colors
              hover:bg-[#F4EEE7]
              hover:text-[#2B2118]
            "
          >
            <User className="h-4 w-4" />
            Profile
          </button>

          <button
            type="button"
            className="
              flex w-full items-center gap-3
              rounded-xl px-3 py-2.5
              text-sm text-[#62574D]
              transition-colors
              hover:bg-[#F4EEE7]
              hover:text-[#2B2118]
            "
          >
            <Settings className="h-4 w-4" />
            Account settings
          </button>

          <div className="my-1 border-t border-[#EFE7DE]" />

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full items-center gap-3
              rounded-xl px-3 py-2.5
              text-sm text-[#9A5542]
              transition-colors
              hover:bg-[#FAECE7]
            "
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
