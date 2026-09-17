"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import { CoffeeLoading } from "@/components/ui/coffee-loading";
import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useReport } from "@/hooks/reports/use-report";

type DatePreset = "TODAY" | "7D" | "30D" | "CUSTOM";

function getDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitialDateRange(preset: DatePreset) {
  const today = new Date();
  const to = getDateString(today);

  const fromDate = new Date(today);

  if (preset === "7D") {
    fromDate.setDate(today.getDate() - 6);
  }

  if (preset === "30D") {
    fromDate.setDate(today.getDate() - 29);
  }

  return {
    from: getDateString(fromDate),
    to,
  };
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatPaymentMethod(method: string) {
  switch (method) {
    case "GCASH":
      return "GCash";

    case "CARD":
      return "Card";

    case "CASH":
      return "Cash";

    case "OTHER":
      return "Other";

    default:
      return method;
  }
}

export default function ReportsPage() {
  const { activeMembership, isLoading: workspaceLoading } = useWorkspace();

  const organizationId = activeMembership?.organization?.id;
  const branchId = activeMembership?.branch?.id;

  const [preset, setPreset] = useState<DatePreset>("TODAY");

  const initialRange = useMemo(() => getInitialDateRange("TODAY"), []);

  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);

  const reportQuery = useReport({
    organizationId,
    branchId,
    from,
    to,
  });

  const report = reportQuery.data;

  const currency = report?.organization.currency ?? "PHP";

  const maxSales = useMemo(() => {
    const values = report?.salesTrend.map((item) => item.sales) ?? [];

    return Math.max(...values, 0);
  }, [report]);

  const applyPreset = (nextPreset: DatePreset) => {
    setPreset(nextPreset);

    if (nextPreset === "CUSTOM") {
      return;
    }

    const range = getInitialDateRange(nextPreset);

    setFrom(range.from);
    setTo(range.to);
  };

  if (workspaceLoading || reportQuery.isLoading) {
    return (
      <div className="pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  if (!organizationId || !activeMembership?.branch) {
    return (
      <div className="pt-6">
        <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
          <BarChart3 className="mx-auto h-7 w-7 text-[#B7A99B]" />

          <p className="mt-3 text-sm font-semibold text-[#5E5248]">
            Reports are unavailable
          </p>

          <p className="mt-1 text-sm text-[#94877A]">
            Please select an active branch and try again.
          </p>
        </div>
      </div>
    );
  }

  if (reportQuery.isError || !report) {
    return (
      <div className="space-y-5 pt-4">
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-center">
          <BarChart3 className="mx-auto h-7 w-7 text-red-500" />

          <p className="mt-3 text-sm font-semibold text-red-700">
            We couldn&apos;t load the reports.
          </p>

          <p className="mt-1 text-sm text-red-600">
            {reportQuery.error instanceof Error
              ? reportQuery.error.message
              : "Please refresh and try again."}
          </p>

          <button
            type="button"
            onClick={() => reportQuery.refetch()}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white hover:bg-[#5E402E]"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 pb-10">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9A8C80]">
            Insights
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#2B2118]">
            Reports
          </h1>

          <p className="mt-1 text-sm text-[#85786C]">
            Performance overview for {activeMembership.branch.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => reportQuery.refetch()}
          disabled={reportQuery.isFetching}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3.5 text-sm font-medium text-[#6F4E37] transition hover:bg-[#FAF6F1] disabled:opacity-50"
        >
          <RefreshCw
            className={
              reportQuery.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"
            }
          />
          Refresh
        </button>
      </div>

      {/* DATE FILTER */}
      <section className="rounded-[26px] border border-[#E7DCCE] bg-[#FFFDF9] p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              ["TODAY", "Today"],
              ["7D", "7 days"],
              ["30D", "30 days"],
              ["CUSTOM", "Custom"],
            ].map(([value, label]) => {
              const active = preset === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => applyPreset(value as DatePreset)}
                  className={[
                    "shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition",
                    active
                      ? "bg-[#6F4E37] text-white shadow-sm"
                      : "border border-[#E7DCCE] bg-[#FFFDF9] text-[#75685D] hover:bg-[#FAF6F1]",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {preset === "CUSTOM" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#95877B]">
                  From
                </span>

                <input
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="h-10 rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3 text-sm text-[#2B2118] outline-none focus:border-[#6F4E37]"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#95877B]">
                  To
                </span>

                <input
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className="h-10 rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3 text-sm text-[#2B2118] outline-none focus:border-[#6F4E37]"
                />
              </label>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-[#918276]">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(from)} — {formatDate(to)}
        </div>
      </section>

      {/* SUMMARY */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Sales"
          value={formatCurrency(report.summary.sales, currency)}
        />

        <SummaryCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Orders"
          value={report.summary.orders.toLocaleString()}
        />

        <SummaryCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Average order"
          value={formatCurrency(report.summary.averageOrderValue, currency)}
        />

        <SummaryCard
          icon={<Clock3 className="h-5 w-5" />}
          label="Completed"
          value={report.summary.completedOrders.toLocaleString()}
        />
      </section>

      {/* SALES TREND */}
      <section className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#2B2118]">
              Sales trend
            </h2>

            <p className="mt-1 text-xs text-[#8E8074]">
              Paid sales across the selected period.
            </p>
          </div>

          <TrendingUp className="h-5 w-5 text-[#6F4E37]" />
        </div>

        {report.salesTrend.length === 0 ? (
          <div className="py-14 text-center">
            <BarChart3 className="mx-auto h-7 w-7 text-[#B7A99B]" />

            <p className="mt-3 text-sm font-medium text-[#675A50]">
              No sales data for this period
            </p>
          </div>
        ) : (
          <div className="mt-8 flex items-end gap-2 overflow-x-auto pb-2">
            {report.salesTrend.map((item) => {
              const height =
                maxSales > 0
                  ? Math.max(
                      (item.sales / maxSales) * 180,
                      item.sales > 0 ? 8 : 3,
                    )
                  : 3;

              return (
                <div
                  key={item.date}
                  className="flex min-w-[52px] flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-[180px] items-end">
                    <div
                      className="w-8 rounded-t-lg bg-[#8B6A50] transition-all"
                      style={{
                        height: `${height}px`,
                      }}
                      title={`${item.sales.toLocaleString()} ${currency}`}
                    />
                  </div>

                  <p className="text-[10px] text-[#8D8075]">
                    {formatDate(item.date)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BREAKDOWNS */}
      <section className="grid gap-4 xl:grid-cols-2">
        <BreakdownCard
          title="Order breakdown"
          subtitle="Orders by service type"
          icon={<ShoppingBag className="h-5 w-5" />}
        >
          {report.orderBreakdown.length === 0 ? (
            <EmptyInline text="No order data." />
          ) : (
            report.orderBreakdown.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between rounded-2xl border border-[#EEE5DC] bg-[#FFFCF8] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[#3E342D]">
                    {item.type === "DINE_IN" ? "Dine-in" : "Takeout"}
                  </p>

                  <p className="mt-1 text-xs text-[#95877B]">
                    {item.count} orders
                  </p>
                </div>

                <p className="text-sm font-semibold text-[#6F4E37]">
                  {formatCurrency(item.sales, currency)}
                </p>
              </div>
            ))
          )}
        </BreakdownCard>

        <BreakdownCard
          title="Payments"
          subtitle="Collected payment methods"
          icon={<CreditCard className="h-5 w-5" />}
        >
          {report.paymentBreakdown.length === 0 ? (
            <EmptyInline text="No payment data." />
          ) : (
            report.paymentBreakdown.map((item) => (
              <div
                key={item.method}
                className="flex items-center justify-between rounded-2xl border border-[#EEE5DC] bg-[#FFFCF8] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[#3E342D]">
                    {formatPaymentMethod(item.method)}
                  </p>

                  <p className="mt-1 text-xs text-[#95877B]">
                    {item.count} payments
                  </p>
                </div>

                <p className="text-sm font-semibold text-[#6F4E37]">
                  {formatCurrency(item.amount, currency)}
                </p>
              </div>
            ))
          )}
        </BreakdownCard>
      </section>

      {/* TOP PRODUCTS */}
      <section className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#2B2118]">
              Top products
            </h2>

            <p className="mt-1 text-xs text-[#8E8074]">
              Best-selling products for the selected period.
            </p>
          </div>

          <Package className="h-5 w-5 text-[#6F4E37]" />
        </div>

        {report.topProducts.length === 0 ? (
          <EmptyState text="No product sales yet." />
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#EEE5DC]">
            <div className="hidden grid-cols-[1fr_120px_150px] gap-4 bg-[#FAF6F1] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#95877B] sm:grid">
              <span>Product</span>
              <span>Quantity</span>
              <span className="text-right">Sales</span>
            </div>

            <div className="divide-y divide-[#EEE5DC]">
              {report.topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_120px_150px] sm:items-center sm:gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0E6DA] text-xs font-bold text-[#6F4E37]">
                      {index + 1}
                    </span>

                    <div>
                      <p className="text-sm font-semibold text-[#3E342D]">
                        {product.productName}
                      </p>

                      <p className="mt-1 text-xs text-[#95877B] sm:hidden">
                        {product.quantity} sold
                      </p>
                    </div>
                  </div>

                  <div className="hidden text-sm text-[#5F5349] sm:block">
                    {product.quantity}
                  </div>

                  <div className="text-sm font-semibold text-[#6F4E37] sm:text-right">
                    {formatCurrency(product.sales, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* INVENTORY + RESERVATIONS + QUEUE */}
      <section className="grid gap-4 xl:grid-cols-3">
        <InsightCard
          icon={<Package className="h-5 w-5" />}
          title="Inventory"
          value={`${report.inventory.totalItems} items`}
          subtitle={`${report.inventory.lowStockCount} low stock · ${report.inventory.outOfStockCount} out of stock`}
        />

        <InsightCard
          icon={<CalendarDays className="h-5 w-5" />}
          title="Reservations"
          value={report.reservations.total.toLocaleString()}
          subtitle={`${report.reservations.confirmed} confirmed · ${report.reservations.completed} completed`}
        />

        <InsightCard
          icon={<Users className="h-5 w-5" />}
          title="Waitlist"
          value={report.queue.total.toLocaleString()}
          subtitle={`${report.queue.waiting} waiting · ${report.queue.seated} seated`}
        />
      </section>

      {/* ALERTS */}
      {(report.inventory.lowStockItems.length > 0 ||
        report.inventory.outOfStockItems.length > 0) && (
        <section className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-[#2B2118]">
              Inventory alerts
            </h2>

            <p className="mt-1 text-xs text-[#8E8074]">
              Items that may need attention.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {report.inventory.outOfStockItems.map((item) => (
              <AlertItem
                key={item.id}
                level="OUT"
                name={item.name}
                stock={`${item.currentStock} ${item.unit}`}
              />
            ))}

            {report.inventory.lowStockItems.map((item) => (
              <AlertItem
                key={item.id}
                level="LOW"
                name={item.name}
                stock={`${item.currentStock} ${item.unit}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
        {icon}
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[#95877B]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-[#2B2118]">
        {value}
      </p>
    </div>
  );
}

function BreakdownCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#2B2118]">{title}</h2>

          <p className="mt-1 text-xs text-[#8E8074]">{subtitle}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
          {icon}
        </div>
      </div>

      <div className="mt-5 space-y-2.5">{children}</div>
    </section>
  );
}

function InsightCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[26px] border border-[#E7DCCE] bg-[#FFFDF9] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0E6DA] text-[#6F4E37]">
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold text-[#2B2118]">{title}</p>

      <p className="mt-1 text-xl font-semibold text-[#6F4E37]">{value}</p>

      <p className="mt-1 text-xs leading-5 text-[#8F8175]">{subtitle}</p>
    </div>
  );
}

function AlertItem({
  level,
  name,
  stock,
}: {
  level: "LOW" | "OUT";
  name: string;
  stock: string;
}) {
  return (
    <div
      className={[
        "rounded-2xl border px-4 py-3",
        level === "OUT"
          ? "border-red-200 bg-red-50"
          : "border-[#E8D5B5] bg-[#FBF2E0]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p
            className={[
              "text-sm font-semibold",
              level === "OUT" ? "text-red-700" : "text-[#795C2A]",
            ].join(" ")}
          >
            {name}
          </p>

          <p
            className={[
              "mt-1 text-xs",
              level === "OUT" ? "text-red-600" : "text-[#8A6D36]",
            ].join(" ")}
          >
            {level === "OUT" ? "Out of stock" : "Low stock"}
          </p>
        </div>

        <span
          className={[
            "shrink-0 text-sm font-semibold",
            level === "OUT" ? "text-red-700" : "text-[#795C2A]",
          ].join(" ")}
        >
          {stock}
        </span>
      </div>
    </div>
  );
}

function EmptyInline({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E1D7CD] px-4 py-6 text-center">
      <p className="text-sm text-[#93867B]">{text}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-12 text-center">
      <BarChart3 className="mx-auto h-7 w-7 text-[#B7A99B]" />

      <p className="mt-3 text-sm text-[#93867B]">{text}</p>
    </div>
  );
}
