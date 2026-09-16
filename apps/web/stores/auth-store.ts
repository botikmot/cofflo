"use client";

import { create } from "zustand";

import { apiFetch } from "@/lib/api";
import type {
  AuthUser,
  //LoginResponse,
} from "@/types/auth";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  hydrated: boolean;
  loading: boolean;

  setAuth: (accessToken: string, user?: AuthUser | null) => void;

  loadMe: () => Promise<AuthUser | null>;
  logout: () => void;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  hydrated: false,
  loading: false,

  setAuth: (accessToken, user = null) => {
    localStorage.setItem("accessToken", accessToken);

    set({
      accessToken,
      user,
    });
  },

  loadMe: async () => {
    set({ loading: true });

    try {
      const user = await apiFetch<AuthUser>("/auth/me");

      set({
        user,
        loading: false,
      });

      return user;
    } catch (error) {
      console.error("AUTH loadMe FAILED:", error);
      localStorage.removeItem("accessToken");

      set({
        accessToken: null,
        user: null,
        loading: false,
      });

      return null;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");

    set({
      user: null,
      accessToken: null,
    });
  },

  hydrate: async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      set({
        hydrated: true,
        accessToken: null,
        user: null,
      });

      return;
    }

    set({ accessToken });

    await useAuthStore.getState().loadMe();

    set({ hydrated: true });
  },
}));
