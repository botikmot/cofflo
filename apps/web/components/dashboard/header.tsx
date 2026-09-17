"use client";

import { useState } from "react";
import { Bell, Menu } from "lucide-react";

import { BrandLogo } from "./brand-logo";
import { CommandNav } from "./command-nav";
import { BranchSwitcher } from "./branch-switcher";
import { UserMenu } from "./user-menu";
import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { selectContext } from "@/services/auth.service";

export function Header() {
  const { user, memberships, activeMembership } = useWorkspace();

  const setActiveMembershipId = useWorkspaceStore(
    (state) => state.setActiveMembershipId,
  );

  const [switchingMembershipId, setSwitchingMembershipId] = useState<
    string | null
  >(null);

  const organization = activeMembership?.organization;

  const role = activeMembership?.role;

  async function handleBranchSwitch(membershipId: string) {
    if (!activeMembership || membershipId === activeMembership.id) {
      return;
    }

    const membership = memberships.find((item) => item.id === membershipId);

    if (!membership) {
      return;
    }

    try {
      setSwitchingMembershipId(membershipId);

      const result = await selectContext({
        organizationId: membership.organizationId,
        branchId: membership.branchId,
      });

      localStorage.setItem("accessToken", result.accessToken);

      localStorage.setItem("activeMembershipId", result.context.membershipId);

      setActiveMembershipId(result.context.membershipId);
    } catch (error) {
      console.error("Failed to switch branch:", error);
    } finally {
      setSwitchingMembershipId(null);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-[1600px]">
          <div
            className="
              grid min-h-[84px]
              grid-cols-[1fr_auto_1fr]
              items-center
              gap-3
              rounded-[24px]
              border border-[#E8DED2]
              bg-[#FFFDF9]/95
              px-3
              py-3
              shadow-[0_12px_40px_rgba(70,45,25,0.07)]
              backdrop-blur-xl
              sm:px-4
              lg:px-5
            "
          >
            {/* LEFT */}
            <div className="min-w-0 justify-self-start">
              <BrandLogo
                businessName={organization?.name ?? "Your Business"}
                logoUrl={null}
                description={
                  organization?.tagline ?? "A cozy neighborhood coffee shop."
                }
              />
            </div>

            {/* CENTER */}
            <div className="hidden justify-self-center lg:block">
              <CommandNav />
            </div>

            {/* RIGHT */}
            <div className="flex shrink-0 items-center gap-1.5 justify-self-end sm:gap-2">
              {/* Branch */}
              <div
                className={
                  switchingMembershipId ? "pointer-events-none opacity-60" : ""
                }
              >
                <BranchSwitcher
                  memberships={memberships}
                  activeMembershipId={activeMembership?.id ?? null}
                  onSelect={handleBranchSwitch}
                />
              </div>

              {/* Notifications */}
              <button
                type="button"
                aria-label="Notifications"
                className="
                  relative flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  text-[#5F544A]
                  transition-all duration-200
                  hover:bg-[#F4EEE7]
                "
              >
                <Bell className="h-[18px] w-[18px]" />

                <span
                  className="
                    absolute right-2.5 top-2.5
                    h-1.5 w-1.5 rounded-full
                    bg-[#A45A3F]
                  "
                />
              </button>

              <div className="hidden h-7 w-px bg-[#E8DED2] sm:block" />

              {/* User */}
              <UserMenu
                firstName={user?.firstName}
                lastName={user?.lastName}
                avatarUrl={user?.avatarUrl}
                role={role}
              />

              {/* Mobile */}
              <button
                type="button"
                aria-label="Open navigation"
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  text-[#5F544A]
                  transition-colors
                  hover:bg-[#F4EEE7]
                  lg:hidden
                "
              >
                <Menu className="h-[19px] w-[19px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="lg:hidden">
        <CommandNav />
      </div>
    </>
  );
}
