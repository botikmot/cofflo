"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import { BrandLogo } from "./brand-logo";
import { CommandNav, navigation, moreItems } from "./command-nav";
import { BranchSwitcher } from "./branch-switcher";
import { UserMenu } from "./user-menu";
import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { selectContext } from "@/services/auth.service";
import { NotificationBell } from "./notification-bell";
import Link from "next/link";

export function Header() {
  const { user, memberships, activeMembership } = useWorkspace();

  const setActiveMembershipId = useWorkspaceStore(
    (state) => state.setActiveMembershipId,
  );

  const [switchingMembershipId, setSwitchingMembershipId] = useState<
    string | null
  >(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            flex min-h-[72px]
            items-center justify-between
            gap-3
            rounded-[24px]
            border border-[#E8DED2]
            bg-[#FFFDF9]/95
            px-3 py-3
            shadow-[0_12px_40px_rgba(70,45,25,0.07)]
            backdrop-blur-xl
            sm:min-h-[84px]
            sm:px-4
            xl:grid
            xl:grid-cols-[1fr_auto_1fr]
            xl:gap-3
            xl:px-5
          "
          >
            {/* LEFT */}
            <div className="min-w-0 flex-1 xl:flex-none xl:justify-self-start">
              <BrandLogo
                businessName={organization?.name ?? "Your Business"}
                logoUrl={organization?.logoUrl ?? null}
                description={
                  organization?.tagline ?? "A cozy neighborhood coffee shop."
                }
              />
            </div>

            {/* CENTER */}
            <div className="hidden justify-self-center xl:block">
              <CommandNav />
            </div>

            {/* RIGHT */}
            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 xl:ml-0 xl:justify-self-end">
              {/* Branch - hidden on mobile */}
              <div
                className={`
                hidden
                sm:block
                ${switchingMembershipId ? "pointer-events-none opacity-60" : ""}
              `}
              >
                <BranchSwitcher
                  memberships={memberships}
                  activeMembershipId={activeMembership?.id ?? null}
                  onSelect={handleBranchSwitch}
                />
              </div>

              {/* Notifications */}
              <NotificationBell
                organizationId={activeMembership?.organizationId ?? null}
                branchId={activeMembership?.branchId ?? null}
              />

              {/* Divider - desktop only */}
              <div className="hidden h-7 w-px bg-[#E8DED2] sm:block" />

              {/* User - desktop/tablet only */}
              <div className="hidden sm:block">
                <UserMenu
                  firstName={user?.firstName}
                  lastName={user?.lastName}
                  avatarUrl={user?.avatarUrl}
                  role={role}
                />
              </div>

              {/* Mobile menu toggle */}
              <button
                type="button"
                aria-label={
                  isMobileMenuOpen ? "Close navigation" : "Open navigation"
                }
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((previous) => !previous)}
                className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl
                    text-[#5F544A]
                    transition-colors
                    hover:bg-[#F4EEE7]
                    xl:hidden
                  "
              >
                {isMobileMenuOpen ? (
                  <X className="h-[19px] w-[19px]" />
                ) : (
                  <Menu className="h-[19px] w-[19px]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] xl:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsMobileMenuOpen(false)}
            className="
              absolute inset-0
              cursor-default
              bg-[#2B2118]/30
              backdrop-blur-[2px]
            "
          />

          {/* Drawer */}
          <aside
            className="
              absolute right-0 top-0
              flex h-full w-[min(86vw,360px)]
              flex-col
              border-l border-[#E8DED2]
              bg-[#FFFDF9]
              px-5 pb-6 pt-5
              shadow-[-15px_0_45px_rgba(70,45,25,0.14)]
              motion-safe:animate-[mobile-drawer-in_220ms_ease-out]
            "
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-[#E8DED2] pb-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#A18B78]">
                  Workspace
                </p>

                <h2 className="mt-1 text-lg font-semibold text-[#2B2118]">
                  Navigation
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setIsMobileMenuOpen(false)}
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  text-[#5F544A]
                  transition-colors
                  hover:bg-[#F4EEE7]
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="mt-5 flex-1 space-y-1 overflow-y-auto">
              {navigation
                .filter((item) => item.label !== "More")
                .map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="
                        flex items-center gap-3
                        rounded-2xl
                        px-4 py-3.5
                        text-sm font-medium
                        text-[#62574D]
                        transition-colors
                        hover:bg-[#F4EEE7]
                        hover:text-[#2B2118]
                      "
                    >
                      <Icon className="h-[18px] w-[18px]" />

                      <span>{item.label}</span>
                    </Link>
                  );
                })}

              {/* More section */}
              <div className="pt-6">
                <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A18B78]">
                  More
                </p>

                {moreItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="
                        flex items-center gap-3
                        rounded-2xl
                        px-4 py-3.5
                        text-sm font-medium
                        text-[#62574D]
                        transition-colors
                        hover:bg-[#F4EEE7]
                        hover:text-[#2B2118]
                      "
                    >
                      <Icon className="h-[18px] w-[18px]" />

                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Drawer footer */}
            <div className="mt-5 rounded-2xl bg-[#F5ECE3] p-4">
              <p className="text-xs font-medium text-[#9A806A]">
                Current branch
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-[#4F392B]">
                {activeMembership?.branch?.name ?? "Main Branch"}
              </p>

              <p className="mt-1 text-xs text-[#9A806A]">
                Manage your daily workflow with Cofflo.
              </p>
            </div>
          </aside>
        </div>
      )}

      <div className="xl:hidden">
        <CommandNav />
      </div>
    </>
  );
}
