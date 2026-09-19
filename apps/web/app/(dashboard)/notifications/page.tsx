"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  BellRing,
  CalendarDays,
  CheckCheck,
  Clock3,
  Inbox,
  ShoppingBag,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  useNotificationStore,
  type Notification as AppNotification,
} from "@/stores/notification-store";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notification.service";
import { useWorkspace } from "@/hooks/auth/use-workspace";
import { navigateFromNotification } from "@/lib/notification-navigation";

function formatNotificationTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getNotificationIcon(type: AppNotification["type"]) {
  switch (type) {
    case "TABLE_RESERVATION":
      return CalendarDays;

    case "WAITLIST_JOINED":
      return Users;

    case "NEW_ORDER":
      return ShoppingBag;

    default:
      return Bell;
  }
}

function getNotificationIconContainer(type: AppNotification["type"]) {
  switch (type) {
    case "TABLE_RESERVATION":
      return "bg-[#F3E8DE] text-[#8B5E3C]";

    case "WAITLIST_JOINED":
      return "bg-[#EEE8F4] text-[#76558F]";

    case "NEW_ORDER":
      return "bg-[#E8F0E8] text-[#527052]";

    default:
      return "bg-[#F1ECE7] text-[#6F6258]";
  }
}

function getNotificationLabel(type: AppNotification["type"]) {
  switch (type) {
    case "TABLE_RESERVATION":
      return "Table Reservation";

    case "WAITLIST_JOINED":
      return "Waitlist";

    case "NEW_ORDER":
      return "Customer Order";

    default:
      return "Notification";
  }
}

export default function NotificationsPage() {
  const router = useRouter();

  const { activeMembership } = useWorkspace();

  const organizationId = activeMembership?.organizationId ?? null;
  const branchId = activeMembership?.branchId ?? null;

  const {
    notifications,
    unreadCount,
    setNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId || !branchId) {
      return;
    }

    const currentOrganizationId = organizationId;
    const currentBranchId = branchId;

    let cancelled = false;

    async function loadNotifications() {
      try {
        setLoading(true);

        const data = await getNotifications(
          currentOrganizationId,
          currentBranchId,
        );

        if (!cancelled) {
          setNotifications(data);
        }
      } catch (error) {
        console.error("[Notifications] Failed to load notifications:", error);

        if (!cancelled) {
          toast.error("Failed to load notifications", {
            description: "Please try again in a moment.",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [organizationId, branchId, setNotifications]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [notifications]);

  async function handleNotificationClick(notification: AppNotification) {
    if (processingId === notification.id) {
      return;
    }

    try {
      setProcessingId(notification.id);

      if (organizationId && branchId && !notification.isRead) {
        await markNotificationAsRead(organizationId, branchId, notification.id);

        markAsRead(notification.id);
      }

      navigateFromNotification(notification, router);
    } catch (error) {
      console.error(
        "[Notifications] Failed to mark notification as read:",
        error,
      );

      toast.error("Something went wrong", {
        description: "The notification could not be opened.",
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleMarkAllAsRead() {
    if (!organizationId || !branchId || unreadCount === 0 || markingAll) {
      return;
    }

    try {
      setMarkingAll(true);

      await markAllNotificationsAsRead(organizationId, branchId);

      markAllAsRead();

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("[Notifications] Failed to mark all as read:", error);

      toast.error("Failed to update notifications", {
        description: "Please try again in a moment.",
      });
    } finally {
      setMarkingAll(false);
    }
  }

  if (!branchId) {
    return (
      <div className="min-h-full bg-[#FFFDF9] p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#E9E0D7] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4EEE7] text-[#6F4E37]">
              <Bell className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-xl font-semibold text-[#3F352E]">
              Notifications
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#81766D]">
              Select a branch to view notifications for that location.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#FFFDF9] p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3E8DE] text-[#6F4E37]">
                <BellRing className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#3F352E]">
                  Notifications
                </h1>

                <p className="mt-0.5 text-sm text-[#81766D]">
                  Stay updated with activity in your branch.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || markingAll}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border border-[#E4D9CF]
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-[#6F4E37]
              transition
              hover:bg-[#F8F3EE]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <CheckCheck className="h-4 w-4" />

            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F4EEE7] px-3.5 py-1.5 text-xs font-medium text-[#6F4E37]">
            <Bell className="h-3.5 w-3.5" />
            {unreadCount} unread
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-[#81766D] ring-1 ring-[#E9E0D7]">
            <Inbox className="h-3.5 w-3.5" />
            {notifications.length} total
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#E9E0D7] bg-white shadow-sm">
          {loading ? (
            <div className="divide-y divide-[#F0E9E3]">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex gap-4 p-5">
                  <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-[#F1ECE7]" />

                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-40 animate-pulse rounded bg-[#F1ECE7]" />

                    <div className="mt-2 h-3 w-full max-w-lg animate-pulse rounded bg-[#F6F1EC]" />

                    <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#F6F1EC]" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedNotifications.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4EEE7] text-[#6F4E37]">
                <Bell className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[#3F352E]">
                You&apos;re all caught up
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#81766D]">
                There are no notifications for this branch yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0E9E3]">
              {sortedNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);

                const iconContainer = getNotificationIconContainer(
                  notification.type,
                );

                const label = getNotificationLabel(notification.type);

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    disabled={processingId === notification.id}
                    className={`
                        group
                        flex
                        w-full
                        gap-4
                        p-5
                        text-left
                        transition
                        hover:bg-[#FCF9F6]
                        disabled:cursor-wait
                        ${!notification.isRead ? "bg-[#FFF9F4]" : "bg-white"}
                      `}
                  >
                    {/* Icon */}
                    <div
                      className={`
                          relative
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${iconContainer}
                        `}
                    >
                      <Icon className="h-5 w-5" />

                      {!notification.isRead && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#A45A3F] ring-2 ring-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <h3
                            className={`
                                truncate text-sm
                                ${
                                  notification.isRead
                                    ? "font-medium text-[#554A42]"
                                    : "font-semibold text-[#3F352E]"
                                }
                              `}
                          >
                            {notification.title}
                          </h3>

                          {!notification.isRead && (
                            <span className="shrink-0 rounded-full bg-[#A45A3F]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#A45A3F]">
                              New
                            </span>
                          )}
                        </div>

                        <span className="flex shrink-0 items-center gap-1 text-xs text-[#9A8E84]">
                          <Clock3 className="h-3.5 w-3.5" />

                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm leading-6 text-[#756A62]">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] font-medium text-[#9A8E84]">
                          {label}
                        </span>

                        <ArrowRight
                          className="
                              h-3.5
                              w-3.5
                              text-[#B2A59B]
                              transition-transform
                              group-hover:translate-x-0.5
                            "
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
