import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AuthGate } from "@/components/auth/auth-gate";
import { NotificationSocketProvider } from "@/components/notifications/notification-socket-provider";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <NotificationSocketProvider />
      <DashboardShell>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </DashboardShell>
    </AuthGate>
  );
}
