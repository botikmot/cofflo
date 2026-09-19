import type { Notification } from "@/stores/notification-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("accessToken");
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_URL}${url}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Notification request failed: ${response.status}`);
  }

  return response.json();
}

export async function getNotifications(
  organizationId: string,
  branchId: string,
) {
  return request<Notification[]>(
    `/notifications/${organizationId}/${branchId}`,
  );
}

export async function getUnreadNotificationCount(
  organizationId: string,
  branchId: string,
) {
  return request<{ count: number }>(
    `/notifications/${organizationId}/${branchId}/unread-count`,
  );
}

export async function markNotificationAsRead(
  organizationId: string,
  branchId: string,
  notificationId: string,
) {
  return request<Notification>(
    `/notifications/${organizationId}/${branchId}/${notificationId}/read`,
    {
      method: "PATCH",
    },
  );
}

export async function markAllNotificationsAsRead(
  organizationId: string,
  branchId: string,
) {
  return request<{ updated: number }>(
    `/notifications/${organizationId}/${branchId}/read-all`,
    {
      method: "PATCH",
    },
  );
}
