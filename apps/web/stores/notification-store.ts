"use client";

import { create } from "zustand";

export type NotificationType =
  | "TABLE_RESERVATION"
  | "WAITLIST_JOINED"
  | "NEW_ORDER";

export interface Notification {
  id: string;
  organizationId: string;
  branchId: string;

  type: NotificationType;

  title: string;
  message: string;

  isRead: boolean;

  referenceId?: string | null;
  referenceType?: string | null;

  createdAt: string;
  updatedAt: string;
}

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;

  setNotifications: (notifications: Notification[]) => void;

  addNotification: (notification: Notification) => void;

  markAsRead: (id: string) => void;

  markAllAsRead: () => void;

  setUnreadCount: (count: number) => void;

  clear: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    set((state) => {
      const existingMap = new Map(
        state.notifications.map((notification) => [
          notification.id,
          notification,
        ]),
      );

      for (const notification of notifications) {
        existingMap.set(notification.id, notification);
      }

      const mergedNotifications = Array.from(existingMap.values())
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 50);

      return {
        notifications: mergedNotifications,
        unreadCount: mergedNotifications.filter(
          (notification) => !notification.isRead,
        ).length,
      };
    });
  },

  addNotification: (notification) => {
    set((state) => {
      const exists = state.notifications.some(
        (item) => item.id === notification.id,
      );

      if (exists) {
        return state;
      }

      const notifications = [notification, ...state.notifications].slice(0, 50);

      return {
        notifications,
        unreadCount: state.unreadCount + 1,
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find((item) => item.id === id);

      if (!notification || notification.isRead) {
        return state;
      }

      return {
        notifications: state.notifications.map((item) =>
          item.id === id
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),

        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((item) => ({
        ...item,
        isRead: true,
      })),

      unreadCount: 0,
    }));
  },

  setUnreadCount: (count) => {
    set({
      unreadCount: Math.max(0, count),
    });
  },

  clear: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));
