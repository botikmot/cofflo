import { create } from "zustand";

type WorkspaceState = {
  activeMembershipId: string | null;
  setActiveMembershipId: (membershipId: string) => void;
  clearWorkspace: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeMembershipId: null,

  setActiveMembershipId: (membershipId) =>
    set({
      activeMembershipId: membershipId,
    }),

  clearWorkspace: () =>
    set({
      activeMembershipId: null,
    }),
}));
