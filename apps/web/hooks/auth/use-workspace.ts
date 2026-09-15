"use client";

import { useEffect } from "react";

import { useCurrentUser } from "./use-current-user";
import { useWorkspaceStore } from "@/stores/workspace.store";

export function useWorkspace() {
  const { data, isLoading, isError } = useCurrentUser();

  const activeMembershipId = useWorkspaceStore(
    (state) => state.activeMembershipId,
  );

  const setActiveMembershipId = useWorkspaceStore(
    (state) => state.setActiveMembershipId,
  );

  useEffect(() => {
    if (!data?.memberships?.length) {
      return;
    }

    const exists = data.memberships.some(
      (membership) => membership.id === activeMembershipId,
    );

    if (!exists) {
      setActiveMembershipId(data.memberships[0].id);
    }
  }, [data, activeMembershipId, setActiveMembershipId]);

  const activeMembership =
    data?.memberships?.find(
      (membership) => membership.id === activeMembershipId,
    ) ??
    data?.memberships?.[0] ??
    null;

  return {
    user: data,
    memberships: data?.memberships ?? [],
    activeMembership,
    isLoading,
    isError,
  };
}
