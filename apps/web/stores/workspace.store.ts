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
    localStorage.setItem("activeMembershipId", membershipId);

    set({
      activeMembershipId: membershipId,
    });
  },

  hydrate: () => {
    const membershipId = localStorage.getItem("activeMembershipId");

    set({
      activeMembershipId: membershipId,
      hydrated: true,
    });
  },

  clearWorkspace: () => {
    localStorage.removeItem("activeMembershipId");

    set({
      activeMembershipId: null,
      hydrated: true,
    });
  },
}));
