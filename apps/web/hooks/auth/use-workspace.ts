"use client";

import { useEffect } from "react";

import { useCurrentUser } from "./use-current-user";
import { useWorkspaceStore } from "@/stores/workspace.store";

export function useWorkspace() {
  const { data, isLoading, isError, refetch } = useCurrentUser();

  const activeMembershipId = useWorkspaceStore(
    (state) => state.activeMembershipId,
  );

  const hydrated = useWorkspaceStore((state) => state.hydrated);

  const hydrateWorkspace = useWorkspaceStore((state) => state.hydrate);

  const setActiveMembershipId = useWorkspaceStore(
    (state) => state.setActiveMembershipId,
  );

  /*
   * ------------------------------------------------------------
   * HYDRATE WORKSPACE
   * ------------------------------------------------------------
   *
   * Restore the previously selected branch from localStorage.
   */

  useEffect(() => {
    if (!hydrated) {
      hydrateWorkspace();
    }
  }, [hydrated, hydrateWorkspace]);

  /*
   * ------------------------------------------------------------
   * ENSURE ACTIVE MEMBERSHIP
   * ------------------------------------------------------------
   *
   * Do not select the first membership until the persisted
   * workspace state has been restored.
   */

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!data?.memberships?.length) {
      return;
    }

    const exists = data.memberships.some(
      (membership) => membership.id === activeMembershipId,
    );

    if (!exists) {
      setActiveMembershipId(data.memberships[0].id);
    }
  }, [hydrated, data, activeMembershipId, setActiveMembershipId]);

  /*
   * ------------------------------------------------------------
   * ACTIVE MEMBERSHIP
   * ------------------------------------------------------------
   */

  const activeMembership =
    data?.memberships?.find(
      (membership) => membership.id === activeMembershipId,
    ) ?? null;

  return {
    user: data,
    memberships: data?.memberships ?? [],
    activeMembership,
    isLoading,
    isError,
    refetchUser: refetch,
  };
}
