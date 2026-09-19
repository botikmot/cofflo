import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

let socket: Socket | null = null;

export function getNotificationSocket() {
  console.log("[Notifications] getNotificationSocket() called");
  if (socket) {
    console.log("[Notifications] Reusing existing socket");
    return socket;
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  console.log("[Notifications] token exists:", !!token);

  if (!token) {
    console.log("[Notifications] No access token, socket not created");
    return null;
  }

  socket = io(`${SOCKET_URL}/notifications`, {
    transports: ["websocket"],
    auth: {
      token,
    },
    autoConnect: true,
  });

  console.log("[Notifications] Socket instance created:", socket);

  socket.on("connect", () => {
    console.log("[Notifications] Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Notifications] Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[Notifications] Socket connection error:", error.message);
  });

  return socket;
}

export function disconnectNotificationSocket() {
  if (!socket) {
    return;
  }

  socket.disconnect();
  socket = null;
}
