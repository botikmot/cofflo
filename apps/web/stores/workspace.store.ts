"use client";

import { create } from "zustand";

type WorkspaceState = {
  activeMembershipId: string | null;
  hydrated: boolean;

  setActiveMembershipId: (membershipId: string) => void;
  hydrate: () => void;
  clearWorkspace: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeMembershipId: null,
  hydrated: false,

  setActiveMembershipId: (membershipId) => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem("activeMembershipId", membershipId);

    set({
      activeMembershipId: membershipId,
    });
  },

  hydrate: () => {
    if (typeof window === "undefined") {
      return;
    }

    const membershipId = localStorage.getItem("activeMembershipId");

    set({
      activeMembershipId: membershipId,
      hydrated: true,
    });
  },

  clearWorkspace: () => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem("activeMembershipId");

    set({
      activeMembershipId: null,
      hydrated: true,
    });
  },
}));
