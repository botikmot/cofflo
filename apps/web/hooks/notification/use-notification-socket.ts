"use client";

import { useEffect } from "react";

import { getNotificationSocket } from "@/lib/socket";
import { useNotificationStore } from "@/stores/notification-store";
import { toast } from "sonner";

interface UseNotificationSocketParams {
  organizationId?: string | null;
  branchId?: string | null;
}

export function useNotificationSocket({
  organizationId,
  branchId,
}: UseNotificationSocketParams) {
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  useEffect(() => {
    console.log("[Notifications] Hook effect:", {
      organizationId,
      branchId,
    });

    if (!organizationId || !branchId) {
      console.log("[Notifications] Waiting for organization/branch...");

      return;
    }

    const socket = getNotificationSocket();

    console.log("[Notifications] Socket returned:", socket);

    if (!socket) {
      console.log("[Notifications] No socket returned");

      return;
    }

    const handleConnect = () => {
      console.log("[Notifications] Socket connected:", socket.id);

      console.log("[Notifications] Joining branch:", {
        organizationId,
        branchId,
      });

      socket.emit(
        "join-branch",
        {
          organizationId,
          branchId,
        },
        (response: unknown) => {
          console.log("[Notifications] Join response:", response);
        },
      );
    };

    const handleNotification = (
      notification: Parameters<typeof addNotification>[0],
    ) => {
      console.log("[Notifications] New notification:", notification);

      // Add to notification bell/store
      addNotification(notification);

      // Show realtime toast
      switch (notification.type) {
        case "TABLE_RESERVATION":
          toast.success(notification.title, {
            description: notification.message,
            duration: 6000,
          });
          break;

        case "WAITLIST_JOINED":
          toast.info(notification.title, {
            description: notification.message,
            duration: 6000,
          });
          break;

        case "NEW_ORDER":
          toast.success(notification.title, {
            description: notification.message,
            duration: 6000,
          });
          break;

        default:
          toast(notification.title, {
            description: notification.message,
            duration: 6000,
          });
      }
    };

    socket.on("connect", handleConnect);

    socket.on("notification:new", handleNotification);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);

      socket.off("notification:new", handleNotification);
    };
  }, [organizationId, branchId, addNotification]);
}
