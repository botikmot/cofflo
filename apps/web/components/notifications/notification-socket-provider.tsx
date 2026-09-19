"use client";

import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useNotificationSocket } from "@/hooks/notification/use-notification-socket";

export function NotificationSocketProvider() {
  const { activeMembership, isLoading: workspaceLoading } = useWorkspace();

  const organizationId = activeMembership?.organization?.id ?? null;

  const branchId = activeMembership?.branch?.id ?? null;

  console.log("[Notifications] Workspace:", {
    workspaceLoading,
    organizationId,
    branchId,
    activeMembershipId: activeMembership?.id,
  });

  useNotificationSocket({
    organizationId,
    branchId,
  });

  return null;
}
