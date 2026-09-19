import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type NotificationType =
  | "TABLE_RESERVATION"
  | "WAITLIST_JOINED"
  | "NEW_ORDER";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string | null;
  referenceType?: string | null;
  branchId: string;
  organizationId: string;
}

export function navigateFromNotification(
  notification: AppNotification,
  router: AppRouterInstance,
) {
  if (!notification.referenceId) {
    return;
  }

  switch (notification.type) {
    case "TABLE_RESERVATION":
      router.push(
        `/bookings?reservationId=${encodeURIComponent(
          notification.referenceId,
        )}`,
      );
      break;

    case "WAITLIST_JOINED":
      router.push(
        `/queue?queueEntryId=${encodeURIComponent(notification.referenceId)}`,
      );
      break;

    case "NEW_ORDER":
      router.push(`/orders/${encodeURIComponent(notification.referenceId)}`);
      break;

    default:
      break;
  }
}
