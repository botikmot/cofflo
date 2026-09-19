"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Bell, Check, ClipboardList, Clock3, MapPin } from "lucide-react";

import { useRouter } from "next/navigation";

import {
  useNotificationStore,
  type Notification,
} from "@/stores/notification-store";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/notification.service";

import { navigateFromNotification } from "@/lib/notification-navigation";

type NotificationBellProps = {
  organizationId?: string | null;
  branchId?: string | null;
};

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "TABLE_RESERVATION":
      return CalendarIcon;

    case "WAITLIST_JOINED":
      return Clock3;

    case "NEW_ORDER":
      return ClipboardList;

    default:
      return Bell;
  }
}

function CalendarIcon(props: React.ComponentProps<typeof Bell>) {
  return <MapPin {...props} />;
}

function formatNotificationTime(date: string) {
  const value = new Date(date);

  const diff = Date.now() - value.getTime();

  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return value.toLocaleDateString();
}

export function NotificationBell({
  organizationId,
  branchId,
}: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const notifications = useNotificationStore((state) => state.notifications);

  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  );

  const markAsRead = useNotificationStore((state) => state.markAsRead);

  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  /*
   * ------------------------------------------------------------
   * LOAD NOTIFICATIONS
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!organizationId || !branchId) {
      return;
    }

    const currentOrganizationId = organizationId;
    const currentBranchId = branchId;

    let cancelled = false;

    async function loadNotifications() {
      try {
        const data = await getNotifications(
          currentOrganizationId,
          currentBranchId,
        );

        if (!cancelled) {
          setNotifications(data);
        }
      } catch (error) {
        console.error("[Notifications] Failed to load notifications:", error);
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [organizationId, branchId, setNotifications]);

  /*
   * ------------------------------------------------------------
   * OUTSIDE CLICK
   * ------------------------------------------------------------
   */

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /*
   * ------------------------------------------------------------
   * CURRENT NOTIFICATIONS
   * ------------------------------------------------------------
   */

  const visibleNotifications = useMemo(
    () => notifications.slice(0, 8),
    [notifications],
  );

  /*
   * ------------------------------------------------------------
   * MARK ONE READ
   * ------------------------------------------------------------
   */

  async function handleNotificationClick(notification: Notification) {
    if (!organizationId || !branchId) {
      return;
    }

    setOpen(false);

    navigateFromNotification(notification, router);

    if (notification.isRead) {
      return;
    }

    markAsRead(notification.id);

    try {
      await markNotificationAsRead(organizationId, branchId, notification.id);
    } catch (error) {
      console.error(
        "[Notifications] Failed to mark notification as read:",
        error,
      );
    }
  }

  /*
   * ------------------------------------------------------------
   * MARK ALL READ
   * ------------------------------------------------------------
   */

  async function handleMarkAllAsRead() {
    if (!organizationId || !branchId) {
      return;
    }

    markAllAsRead();

    try {
      await markAllNotificationsAsRead(organizationId, branchId);
    } catch (error) {
      console.error("[Notifications] Failed to mark all as read:", error);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* ---------------------------------------------------- */}
      {/* BELL */}
      {/* ---------------------------------------------------- */}

      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#5F544A] transition-all duration-200 hover:bg-[#F4EEE7]"
      >
        <Bell
          className={`
            h-[19px] w-[19px]
            transition-transform duration-200
            ${
              unreadCount > 0
                ? "animate-[bell-ring_1.8s_ease-in-out_infinite]"
                : ""
            }
            `}
        />

        {unreadCount > 0 && (
          <>
            {/* Pulse ring */}
            <span
              className="
                absolute right-0.5 top-0
                h-[18px] w-[18px]
                rounded-full
                bg-[#A45A3F]/30
                animate-ping
            "
            />

            {/* Notification count */}
            <span
              className="
                absolute right-0.5 top-0
                z-10
                flex h-[18px] min-w-[18px]
                items-center justify-center
                rounded-full
                bg-[#A45A3F]
                px-1
                text-[9px]
                font-bold
                leading-none
                text-white
                shadow-[0_2px_6px_rgba(164,90,63,0.35)]
                ring-2 ring-[#FFFDF9]
                animate-[badge-pop_0.3s_ease-out]
            "
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* ---------------------------------------------------- */}
      {/* DROPDOWN */}
      {/* ---------------------------------------------------- */}

      <div
        className={`
          absolute right-0 top-full z-[60]
          mt-2
          w-[360px]
          origin-top-right
          transition-all duration-150
          ${
            open
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-1 opacity-0"
          }
        `}
      >
        <div
          className="
            overflow-hidden
            rounded-[22px]
            border border-[#E8DED2]
            bg-[#FFFDF9]
            shadow-[0_20px_60px_rgba(70,45,25,0.15)]
          "
        >
          {/* HEADER */}

          <div
            className="
              flex items-center justify-between
              border-b border-[#EFE6DC]
              px-4 py-3.5
            "
          >
            <div>
              <p className="text-sm font-semibold text-[#2B2118]">
                Notifications
              </p>

              <p className="mt-0.5 text-[11px] text-[#9A8D80]">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="
                  flex items-center gap-1.5
                  rounded-lg
                  px-2 py-1.5
                  text-[10px]
                  font-semibold
                  text-[#6F4E37]
                  transition-colors
                  hover:bg-[#F4ECE4]
                "
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* BODY */}

          <div className="max-h-[420px] overflow-y-auto">
            {visibleNotifications.length === 0 ? (
              <div
                className="
                  flex flex-col
                  items-center
                  justify-center
                  px-6 py-12
                  text-center
                "
              >
                <div
                  className="
                    flex h-12 w-12
                    items-center justify-center
                    rounded-2xl
                    bg-[#F4ECE4]
                  "
                >
                  <Bell className="h-5 w-5 text-[#8A6A50]" />
                </div>

                <p className="mt-3 text-sm font-semibold text-[#3B3027]">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-[#A3988E]">
                  New reservations, waitlist entries, and orders will appear
                  here.
                </p>
              </div>
            ) : (
              visibleNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                        flex w-full gap-3
                        border-b border-[#F0E8DE]
                        px-4 py-3.5
                        text-left
                        transition-colors
                        hover:bg-[#FAF6F1]
                        ${notification.isRead ? "" : "bg-[#FFFBF6]"}
                      `}
                  >
                    {/* ICON */}

                    <div
                      className={`
                          mt-0.5
                          flex h-9 w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${
                            notification.type === "NEW_ORDER"
                              ? "bg-[#E8F0E7] text-[#60745C]"
                              : notification.type === "WAITLIST_JOINED"
                                ? "bg-[#F5EBDD] text-[#9A704A]"
                                : "bg-[#F0E7DF] text-[#8A6047]"
                          }
                        `}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`
                              text-xs
                              ${
                                notification.isRead
                                  ? "font-medium text-[#5F544A]"
                                  : "font-semibold text-[#2B2118]"
                              }
                            `}
                        >
                          {notification.title}
                        </p>

                        {!notification.isRead && (
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A45A3F]" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#8D8176]">
                        {notification.message}
                      </p>

                      <p className="mt-1.5 text-[9px] font-medium text-[#B0A298]">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* FOOTER */}

          {notifications.length > 0 && (
            <div className="border-t border-[#EFE6DC] px-4 py-2.5">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/notifications");
                }}
                className="
                  w-full
                  rounded-lg
                  py-2
                  text-center
                  text-[10px]
                  font-semibold
                  text-[#6F4E37]
                  transition-colors
                  hover:bg-[#F4ECE4]
                "
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
