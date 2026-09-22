"use client";

import {
  ClipboardList,
  Coffee,
  ShoppingBag,
  Users,
  Sun,
  Moon,
  CloudSun,
  type LucideIcon,
} from "lucide-react";

import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useDashboard } from "@/hooks/dashboard/use-dashboard";
import type { DashboardTable } from "@/types/dashboard";
import type { Order } from "@/types/order";
import { useCurrency } from "@/hooks/settings/use-currency";
import { CoffeeHeroVisual } from "@/components/dashboard/coffee-visual";

import {
  calculateOccupiedTables,
  calculateTodaySales,
  getOrderStatusCounts,
  getRecentOrders,
  getTodayOrders,
} from "@/lib/dashboard";

import { CoffeeLoading } from "@/components/ui/coffee-loading";
import { useEffect, useState } from "react";

type TimeGreeting = {
  label: string;
  title: string;
  description: string;
  icon: "sun" | "cloud-sun" | "moon";
};

const GREETING_ICONS: Record<string, LucideIcon> = {
  morning: Sun,
  afternoon: CloudSun,
  evening: Moon,
};

function GreetingIconView({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = GREETING_ICONS[icon] ?? Sun;

  return <Icon className={className} />;
}

function getTimeGreeting(): TimeGreeting {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      label: "Good morning",
      title: "Ready for a great day?",
      description:
        "Here’s a quick look at what’s happening across your café today.",
      icon: "sun",
    };
  }

  if (hour >= 12 && hour < 18) {
    return {
      label: "Good afternoon",
      title: "Keep the good flow going.",
      description:
        "Here’s a quick look at what’s happening across your café this afternoon.",
      icon: "cloud-sun",
    };
  }

  return {
    label: "Good evening",
    title: "Let’s wrap up a great day.",
    description:
      "Here’s a quick look at what’s happening across your café this evening.",
    icon: "moon",
  };
}

function normalizeDashboardOrders(value: unknown): Order[] {
  if (Array.isArray(value)) {
    return value as Order[];
  }

  if (value && typeof value === "object" && "data" in value) {
    const data = (
      value as {
        data?: unknown;
      }
    ).data;

    if (Array.isArray(data)) {
      return data as Order[];
    }
  }

  return [];
}

export default function DashboardPage() {
  const { activeMembership, isLoading: workspaceLoading } = useWorkspace();

  const organizationId = activeMembership?.organization?.id ?? null;
  const branchId = activeMembership?.branch?.id ?? null;

  const organization = activeMembership?.organization;

  const { formatCurrency } = useCurrency();

  const [greeting, setGreeting] = useState<TimeGreeting>(() =>
    getTimeGreeting(),
  );

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getTimeGreeting());
    };

    updateGreeting();

    const interval = window.setInterval(updateGreeting, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const {
    data,
    isLoading: dashboardLoading,
    isError,
  } = useDashboard({
    organizationId: organizationId ?? undefined,
    branchId: branchId ?? undefined,
  });

  if (workspaceLoading || dashboardLoading) {
    return (
      <div className="pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  if (!activeMembership) {
    return (
      <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
        <p className="text-sm font-medium text-[#6F4E37]">
          No workspace found.
        </p>
      </div>
    );
  }

  if (!activeMembership.branch) {
    return (
      <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
        <p className="text-sm font-medium text-[#6F4E37]">
          No branch is assigned to this account.
        </p>

        <p className="mt-1 text-sm text-[#94877A]">
          Please select a branch or contact your workspace administrator.
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
        <p className="text-sm font-medium text-[#6F4E37]">
          We couldn&apos;t prepare your dashboard.
        </p>

        <p className="mt-1 text-sm text-[#94877A]">
          Please refresh and try again.
        </p>
      </div>
    );
  }

  const dashboardOrders = normalizeDashboardOrders(data.orders);

  const todayOrders = getTodayOrders(dashboardOrders);

  const todaySales = calculateTodaySales(data.orders);

  const tableStats = calculateOccupiedTables(data.tables);

  const recentOrders = getRecentOrders(todayOrders);

  const orderStatusCounts = getOrderStatusCounts(todayOrders);

  return (
    <div className="space-y-8 pt-4">
      {/* HERO */}

      <section
        className="
          relative overflow-hidden
          rounded-[28px]
          border border-[#E8D9C9]
          bg-[#F1E5D5]
        "
      >
        {/* Decorative background shapes */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -left-24 -top-28
            h-80 w-80
            rounded-full
            bg-[#E5D1B9]/45
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -bottom-40 -right-28
            h-[420px] w-[420px]
            rounded-full
            bg-[#E5D1B9]/25
          "
        />

        <div
          className="
            relative z-10
            grid
            grid-cols-1
            lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]
          "
        >
          {/* LEFT: Greeting */}
          <div
            className="
              flex flex-col justify-center
              p-6
              sm:p-8
              lg:p-10
              xl:p-12
            "
          >
            <div className="flex items-center gap-2">
              <GreetingIconView
                icon={greeting.icon}
                className="h-4 w-4 text-[#9A7658]"
              />

              <p
                className="
                  text-xs font-medium
                  uppercase tracking-[0.16em]
                  text-[#896B53]
                  sm:text-sm
                "
              >
                {greeting.label}
              </p>
            </div>

            <h1
              className="
                mt-4
                max-w-xl
                text-3xl font-semibold
                leading-[1.12]
                tracking-[-0.045em]
                text-[#211810]
                sm:text-4xl
                lg:text-[42px]
              "
            >
              {greeting.title}
            </h1>

            <p
              className="
                mt-4
                max-w-xl
                text-sm leading-6
                text-[#806955]
                sm:text-base
              "
            >
              {greeting.description}
            </p>

            {/* Hero indicator */}
            <div className="mt-6 flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-[#6F4E37]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#C3A487]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#C3A487]" />
            </div>
          </div>

          {/* RIGHT: Animated coffee visual */}
          <div className="relative min-w-0 flex items-center justify-center">
            <CoffeeHeroVisual />
            {/* Daily rhythm message */}
            <div
              className="
                coffee-message-float
                absolute
                bottom-[15px]
                right-[20px]
                z-20
                hidden
                text-right
                lg:block
              "
            >
              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#A18B78]
                "
              >
                Your daily rhythm
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  tracking-[-0.02em]
                  text-[#6F4E37]
                "
              >
                {organization?.tagline ?? "A cozy neighborhood coffee shop."}
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  font-medium
                  text-[#A18B78]
                "
              >
                Small steps. Better flow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat
          label="Today's sales"
          value={formatCurrency(todaySales)}
          detail={`${todayOrders.length} orders today`}
          icon={Coffee}
        />

        <DashboardStat
          label="Orders"
          value={todayOrders.length.toString()}
          detail="Orders received today"
          icon={ShoppingBag}
        />

        <DashboardStat
          label="Tables"
          value={`${tableStats.occupied} / ${tableStats.total}`}
          detail="Currently occupied"
          icon={ClipboardList}
        />

        <DashboardStat
          label="Active guests"
          value="—"
          detail="Queue integration next"
          icon={Users}
        />
      </section>

      {/* CONTENT */}
      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <RecentOrders orders={recentOrders} />

        <TablePulse tables={data.tables} />
      </section>

      <OrderStatusOverview counts={orderStatusCounts} />
    </div>
  );
}

type DashboardStatProps = {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

function DashboardStat({
  label,
  value,
  detail,
  icon: Icon,
}: DashboardStatProps) {
  return (
    <div
      className="
        group rounded-[24px]
        border border-[#E7DCCE]
        bg-[#FFFDF9]
        p-5
        shadow-[0_10px_35px_rgba(70,45,25,0.045)]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_16px_40px_rgba(70,45,25,0.08)]
      "
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-[#8B7D70]">{label}</p>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5ECE3] text-[#6F4E37]">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#2B2118]">
        {value}
      </p>

      <p className="mt-2 text-xs font-medium text-[#7D6D5E]">{detail}</p>
    </div>
  );
}

function RecentOrders({
  orders,
}: {
  orders: ReturnType<typeof getRecentOrders>;
}) {
  const { formatCurrency } = useCurrency();

  return (
    <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 shadow-[0_10px_35px_rgba(70,45,25,0.045)] sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#9A8C80]">
            Live activity
          </p>

          <h2 className="mt-1 text-lg font-semibold">Recent orders</h2>
        </div>

        <span className="rounded-full bg-[#EEF3EA] px-3 py-1 text-xs font-medium text-[#587052]">
          Live
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-2xl bg-[#FAF6F1] p-6 text-center">
            <p className="text-sm font-medium text-[#6F6257]">Quiet counter</p>

            <p className="mt-1 text-xs text-[#9B8E82]">No orders yet today.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-2xl bg-[#FAF6F1] p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">{order.orderNumber}</p>

                <p className="mt-0.5 truncate text-xs text-[#8A7D71]">
                  {order.table?.name ?? order.orderType.replace("_", " ")}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatCurrency(Number(order.total))}
                </p>

                <p className="mt-0.5 text-xs text-[#7D6F63]">{order.status}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TablePulse({ tables }: { tables: DashboardTable[] }) {
  return (
    <div className="rounded-[28px] border border-[#E7DCCE] bg-[#2B2118] p-6 text-[#FFFDF9] shadow-[0_16px_40px_rgba(43,33,24,0.14)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#CDB9A5]">
            Floor status
          </p>

          <h2 className="mt-1 text-lg font-semibold">Table pulse</h2>
        </div>

        <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-[#D9C9BA]">
          {tables.filter((table) => table.isActive).length} active
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tables.map((table) => {
          const status = table.status.toUpperCase();

          const isOccupied = status === "OCCUPIED";
          const isReserved = status === "RESERVED";
          const isAvailable = status === "AVAILABLE";

          return (
            <div
              key={table.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-base font-semibold">
                  {table.name}
                </div>

                <span
                  className={[
                    "h-2 w-2 shrink-0 rounded-full",
                    isOccupied
                      ? "bg-[#C98B6B]"
                      : isReserved
                        ? "bg-[#D2B27B]"
                        : isAvailable
                          ? "bg-[#8FA383]"
                          : "bg-[#9A8E84]",
                  ].join(" ")}
                />
              </div>

              <div className="mt-2 text-xs uppercase tracking-wide text-[#CDB9A5]">
                {table.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type OrderStatusCounts = ReturnType<typeof getOrderStatusCounts>;

function OrderStatusOverview({ counts }: { counts: OrderStatusCounts }) {
  const statuses = [
    {
      key: "PENDING",
      label: "Pending",
      value: counts.PENDING,
    },
    {
      key: "CONFIRMED",
      label: "Confirmed",
      value: counts.CONFIRMED,
    },
    {
      key: "PREPARING",
      label: "Preparing",
      value: counts.PREPARING,
    },
    {
      key: "READY",
      label: "Ready",
      value: counts.READY,
    },
    {
      key: "COMPLETED",
      label: "Completed",
      value: counts.COMPLETED,
    },
    {
      key: "CANCELLED",
      label: "Cancelled",
      value: counts.CANCELLED,
    },
  ];

  const total = statuses.reduce((sum, status) => sum + status.value, 0);

  return (
    <section className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 shadow-[0_10px_35px_rgba(70,45,25,0.045)] sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#9A8C80]">
            Order flow
          </p>

          <h2 className="mt-1 text-lg font-semibold text-[#2B2118]">
            Today&apos;s order status
          </h2>
        </div>

        <span className="rounded-full bg-[#F5ECE3] px-3 py-1 text-xs font-medium text-[#6F4E37]">
          {total} total
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statuses.map((status) => (
          <div
            key={status.key}
            className="rounded-2xl border border-[#EEE4DA] bg-[#FAF6F1] p-4"
          >
            <p className="text-xs font-medium text-[#8B7D70]">{status.label}</p>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#2B2118]">
              {status.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
