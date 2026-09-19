"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";

import type { AuthMembership } from "@/types/auth";
import { useWorkspaceStore } from "@/stores/workspace.store";

type BranchSwitcherProps = {
  memberships: AuthMembership[];
  activeMembershipId: string | null;
  onSelect: (membershipId: string) => void;
};

export function BranchSwitcher({
  memberships,
  activeMembershipId: propActiveMembershipId,
  onSelect,
}: BranchSwitcherProps) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  /*
   * ------------------------------------------------------------
   * WORKSPACE STORE
   * ------------------------------------------------------------
   */

  const storeActiveMembershipId = useWorkspaceStore(
    (state) => state.activeMembershipId,
  );

  const hydrated = useWorkspaceStore((state) => state.hydrated);

  const setActiveMembershipId = useWorkspaceStore(
    (state) => state.setActiveMembershipId,
  );

  /*
   * ------------------------------------------------------------
   * BRANCH MEMBERSHIPS
   * ------------------------------------------------------------
   */

  const branchMemberships = useMemo(
    () => memberships.filter((membership) => membership.branch !== null),
    [memberships],
  );

  /*
   * ------------------------------------------------------------
   * ACTIVE MEMBERSHIP
   *
   * After hydration, the persisted store value is authoritative.
   * Before hydration, use the parent prop as temporary fallback.
   * ------------------------------------------------------------
   */

  const activeMembershipId = hydrated
    ? storeActiveMembershipId
    : propActiveMembershipId;

  const activeMembership = useMemo(() => {
    if (!branchMemberships.length) {
      return null;
    }

    return (
      branchMemberships.find(
        (membership) => membership.id === activeMembershipId,
      ) ?? null
    );
  }, [branchMemberships, activeMembershipId]);

  /*
   * ------------------------------------------------------------
   * ENSURE ACTIVE BRANCH EXISTS
   *
   * Only initialize a default branch when:
   * - Workspace has hydrated
   * - Branch memberships are available
   * - No saved branch exists
   * - Or saved branch is no longer available
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!hydrated || !branchMemberships.length) {
      return;
    }

    const activeStillExists = branchMemberships.some(
      (membership) => membership.id === storeActiveMembershipId,
    );

    if (storeActiveMembershipId && activeStillExists) {
      return;
    }

    const firstMembership = branchMemberships[0];

    setActiveMembershipId(firstMembership.id);
    onSelect(firstMembership.id);
  }, [
    hydrated,
    branchMemberships,
    storeActiveMembershipId,
    setActiveMembershipId,
    onSelect,
  ]);

  /*
   * ------------------------------------------------------------
   * OUTSIDE CLICK
   * ------------------------------------------------------------
   */

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /*
   * ------------------------------------------------------------
   * NO BRANCH
   * ------------------------------------------------------------
   */

  if (!activeMembership?.branch) {
    return null;
  }

  const multipleBranches = branchMemberships.length > 1;

  /*
   * ------------------------------------------------------------
   * SELECT BRANCH
   * ------------------------------------------------------------
   */

  function handleSelect(membershipId: string) {
    setOpen(false);

    setActiveMembershipId(membershipId);

    onSelect(membershipId);
  }

  /*
   * ------------------------------------------------------------
   * UI
   * ------------------------------------------------------------
   */

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => multipleBranches && setOpen((value) => !value)}
        aria-expanded={multipleBranches ? open : undefined}
        className="
          flex items-center gap-2
          rounded-xl
          border border-[#E8DED2]
          bg-[#F8F4EE]
          px-3 py-2
          transition-all duration-200
          hover:-translate-y-px
          hover:bg-[#F2EBE3]
          hover:shadow-sm
        "
      >
        <span className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-white">
          <MapPin className="h-3.5 w-3.5 text-[#8A6A50]" />

          {activeMembership.branch.isActive && (
            <span
              className="
                absolute
                -right-0.5
                -top-0.5
                h-1.5
                w-1.5
                rounded-full
                bg-[#718768]
              "
            />
          )}
        </span>

        <div className="hidden text-left leading-tight sm:block">
          <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#9A8D80]">
            Location
          </p>

          <p className="max-w-[130px] truncate text-xs font-semibold text-[#3B3027]">
            {activeMembership.branch.name}
          </p>
        </div>

        {multipleBranches && (
          <ChevronDown
            className={`h-3.5 w-3.5 text-[#8A7A6C] transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {multipleBranches && (
        <div
          className={`
            absolute right-0 top-full z-50 pt-2
            w-[280px]
            transition-all duration-150
            ${
              open
                ? "visible translate-y-0 opacity-100"
                : "pointer-events-none invisible translate-y-1 opacity-0"
            }
          `}
        >
          <div
            className="
              rounded-[20px]
              border border-[#E8DED2]
              bg-[#FFFDF9]
              p-2
              shadow-[0_20px_55px_rgba(70,45,25,0.14)]
            "
          >
            <div className="px-3 pb-2 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9A8D80]">
                Switch location
              </p>

              <p className="mt-1 text-xs text-[#B0A298]">
                Choose the workspace you want to manage
              </p>
            </div>

            <div className="space-y-1">
              {branchMemberships.map((membership) => {
                if (!membership.branch) {
                  return null;
                }

                const active = membership.id === activeMembership.id;

                return (
                  <button
                    key={membership.id}
                    type="button"
                    onClick={() => handleSelect(membership.id)}
                    className={`
                      flex w-full items-center gap-3
                      rounded-xl px-3 py-3
                      text-left
                      transition-all duration-150
                      ${active ? "bg-[#F4ECE4]" : "hover:bg-[#FAF6F1]"}
                    `}
                  >
                    <div
                      className={`
                        flex h-9 w-9 shrink-0
                        items-center justify-center
                        rounded-xl
                        ${
                          active
                            ? "bg-[#6F4E37] text-white"
                            : "bg-[#F0E8DE] text-[#6F4E37]"
                        }
                      `}
                    >
                      <MapPin className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#2B2118]">
                        {membership.branch.name}
                      </p>

                      <p className="truncate text-xs text-[#928478]">
                        {membership.organization.name}
                      </p>
                    </div>

                    {active && <Check className="h-4 w-4 text-[#6F4E37]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
