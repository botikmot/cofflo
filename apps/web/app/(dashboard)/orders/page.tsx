"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  ShoppingBag,
  Utensils,
  X,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { CoffeeLoading } from "@/components/ui/coffee-loading";
import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useOrders } from "@/hooks/orders/use-orders";

import type { Order, OrderStatus } from "@/types/order";

const statusTabs: {
  label: string;
  value: "ALL" | OrderStatus;
}[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const PAGE_SIZE = 20;

export default function OrdersPage() {
  const { activeMembership, isLoading: workspaceLoading } = useWorkspace();

  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus>("ALL");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const organizationId = activeMembership?.organization?.id;

  const branchId = activeMembership?.branch?.id;

  const {
    data,
    isLoading: ordersLoading,
    isFetching,
    isError,
  } = useOrders({
    organizationId,
    branchId,
    page,
    limit: PAGE_SIZE,
    status: statusFilter,
    search,
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  if (workspaceLoading || ordersLoading) {
    return (
      <div className="pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-5 pt-4">
        <div className="rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
          <ShoppingBag className="mx-auto h-7 w-7 text-[#B7A99B]" />

          <p className="mt-3 text-sm font-semibold text-[#5E5248]">
            We couldn&apos;t load your orders.
          </p>

          <p className="mt-1 text-sm text-[#94877A]">
            Please refresh and try again.
          </p>
        </div>
      </div>
    );
  }

  function handleStatusChange(value: "ALL" | OrderStatus) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function goToPreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function goToNextPage() {
    if (!meta) {
      return;
    }

    setPage((current) => Math.min(meta.totalPages, current + 1));
  }

  return (
    <div className="space-y-5 pt-3 pb-8">
      {/* HEADER */}
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A8C80]">
              Café operations
            </p>

            <span className="rounded-full bg-[#F0E6DA] px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#6F4E37]">
              Today
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2B2118] sm:text-3xl">
            Orders
          </h1>

          <p className="mt-1 text-xs text-[#817469] sm:text-sm">
            Manage today&apos;s orders and keep the counter moving.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {meta && (
            <div className="hidden rounded-xl border border-[#E7DCCE] bg-[#FFFDF9] px-3 py-2 text-right sm:block">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-[#9A8C80]">
                Today
              </p>

              <p className="mt-0.5 text-xs font-semibold text-[#3E342D]">
                {meta.total} {meta.total === 1 ? "order" : "orders"}
              </p>
            </div>
          )}

          <Link
            href="/orders/new"
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl
              bg-[#6F4E37]
              px-3.5 py-2.5
              text-xs font-semibold
              text-white
              shadow-sm
              transition-all duration-200
              hover:-translate-y-px
              hover:bg-[#5E402D]
            "
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            New order
          </Link>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="rounded-[20px] border border-[#E7DCCE] bg-[#FFFDF9] p-2.5 shadow-[0_8px_24px_rgba(70,45,25,0.03)]">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          {/* STATUS */}
          <div className="overflow-x-auto">
            <div className="flex min-w-max gap-1.5">
              {statusTabs.map((tab) => {
                const active = statusFilter === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => handleStatusChange(tab.value)}
                    className={[
                      "rounded-xl px-3 py-2 text-[11px] font-semibold transition-all duration-150",
                      active
                        ? "bg-[#6F4E37] text-white shadow-sm"
                        : "text-[#796C61] hover:bg-[#F6EFE7] hover:text-[#2B2118]",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEARCH */}
          <div className="relative w-full xl:max-w-[300px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9A8D80]" />

            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search order or table..."
              className="
                h-9 w-full
                rounded-xl
                border border-[#E7DCCE]
                bg-[#FFFCF8]
                pl-9 pr-9
                text-xs text-[#2B2118]
                outline-none
                transition
                placeholder:text-[#A69A8F]
                focus:border-[#B99A80]
                focus:ring-2
                focus:ring-[#6F4E37]/10
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-[#9A8D80] transition hover:bg-[#F1E9E1] hover:text-[#5F5147]"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FETCHING INDICATOR */}
      {isFetching && !ordersLoading && (
        <div className="flex items-center gap-2 text-[10px] font-medium text-[#96887D]">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#DCCFC4] border-t-[#6F4E37]" />
          Updating orders...
        </div>
      )}

      {/* ORDER LIST */}
      <section className="space-y-2.5">
        {orders.length === 0 ? (
          <EmptyOrders search={search} statusFilter={statusFilter} />
        ) : (
          orders.map((order) => <OrderRow key={order.id} order={order} />)
        )}
      </section>

      {/* PAGINATION */}
      {meta && meta.totalPages > 1 && (
        <section className="flex flex-col gap-3 rounded-[20px] border border-[#E7DCCE] bg-[#FFFDF9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#4C4036]">
              Page {meta.page} of {meta.totalPages}
            </p>

            <p className="mt-0.5 text-[10px] text-[#988B80]">
              {meta.total} {meta.total === 1 ? "order" : "orders"} today
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={meta.page <= 1 || isFetching}
              className="
                inline-flex items-center gap-1
                rounded-xl
                border border-[#DDD0C5]
                bg-[#FFFDF9]
                px-3 py-2
                text-[10px] font-semibold
                text-[#6F4E37]
                transition
                hover:bg-[#F7F0E9]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            <div className="hidden items-center gap-1 sm:flex">
              {buildPageNumbers(meta.page, meta.totalPages).map(
                (pageNumber, index) =>
                  pageNumber === "ellipsis" ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1 text-[10px] text-[#A79A8F]"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      disabled={isFetching}
                      className={[
                        "h-8 min-w-8 rounded-lg px-2 text-[10px] font-semibold transition",
                        pageNumber === meta.page
                          ? "bg-[#6F4E37] text-white"
                          : "text-[#6F6258] hover:bg-[#F7F0E9]",
                      ].join(" ")}
                    >
                      {pageNumber}
                    </button>
                  ),
              )}
            </div>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={meta.page >= meta.totalPages || isFetching}
              className="
                inline-flex items-center gap-1
                rounded-xl
                border border-[#DDD0C5]
                bg-[#FFFDF9]
                px-3 py-2
                text-[10px] font-semibold
                text-[#6F4E37]
                transition
                hover:bg-[#F7F0E9]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const isPaid = order.paymentStatus === "PAID";

  const isDineIn = order.orderType === "DINE_IN";

  return (
    <div
      className="
        rounded-[20px]
        border border-[#E7DCCE]
        bg-[#FFFDF9]
        px-4 py-3.5
        shadow-[0_6px_22px_rgba(70,45,25,0.025)]
        transition-all duration-200
        hover:-translate-y-px
        hover:shadow-[0_10px_28px_rgba(70,45,25,0.055)]
      "
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-[#2B2118]">
              {order.orderNumber}
            </p>

            <StatusBadge status={order.status} />

            <span className="rounded-full bg-[#F5EEE7] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#8A796C]">
              {isDineIn ? "Dine-in" : "Takeout"}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#8E8176]">
            <span className="flex items-center gap-1.5">
              {isDineIn ? (
                <Utensils className="h-3 w-3" />
              ) : (
                <ShoppingBag className="h-3 w-3" />
              )}

              {order.table?.name ?? order.orderType.replace("_", " ")}
            </span>

            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" />
              {itemCount} item
              {itemCount !== 1 ? "s" : ""}
            </span>

            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3 w-3" />

              {formatOrderTime(order.createdAt)}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <div className="text-left lg:text-right">
            <p className="text-base font-semibold tracking-tight text-[#2B2118]">
              {order.currency}{" "}
              {Number(order.total).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>

            <p
              className={[
                "mt-0.5 text-[10px] font-medium",
                isPaid ? "text-[#5F7757]" : "text-[#A46D43]",
              ].join(" ")}
            >
              {isPaid ? "Paid" : "Payment pending"}
            </p>
          </div>

          <Link
            href={`/orders/${order.id}`}
            className="
              rounded-xl
              border border-[#E4D9CE]
              px-3 py-2
              text-[10px] font-semibold
              text-[#6F4E37]
              transition
              hover:bg-[#F7F0E8]
            "
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    PENDING: "bg-[#FFF3DF] text-[#9A6B2F]",
    CONFIRMED: "bg-[#EAF0F8] text-[#58718D]",
    PREPARING: "bg-[#F3EAE0] text-[#795D48]",
    READY: "bg-[#E8F1E5] text-[#5F7657]",
    COMPLETED: "bg-[#E8F1E5] text-[#56704E]",
    CANCELLED: "bg-[#F7E8E4] text-[#995B48]",
  };

  return (
    <span
      className={[
        "rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function EmptyOrders({
  search,
  statusFilter,
}: {
  search: string;
  statusFilter: "ALL" | OrderStatus;
}) {
  const hasFilters = Boolean(search.trim()) || statusFilter !== "ALL";

  return (
    <div className="rounded-[24px] border border-dashed border-[#DED1C3] bg-[#FFFDF9] px-6 py-12 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4ECE4] text-[#6F4E37]">
        <ShoppingBag className="h-5 w-5" />
      </div>

      <h2 className="mt-3 text-sm font-semibold text-[#2B2118]">
        {hasFilters ? "No matching orders" : "No orders today"}
      </h2>

      <p className="mt-1 text-xs text-[#978A7E]">
        {hasFilters
          ? "Try another status or search term."
          : "Orders created today will appear here."}
      </p>
    </div>
  );
}

function formatOrderTime(value: string) {
  return new Date(value).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildPageNumbers(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}
