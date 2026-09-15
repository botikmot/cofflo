"use client";

import {
  CheckCircle2,
  Clock3,
  Search,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import { useMemo, useState } from "react";

import { CoffeeLoading } from "@/components/ui/coffee-loading";
import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useOrders } from "@/hooks/orders/use-orders";
import Link from "next/link";

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

export default function OrdersPage() {
  const { activeMembership, isLoading: workspaceLoading } = useWorkspace();

  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus>("ALL");

  const [search, setSearch] = useState("");

  const organizationId = activeMembership?.organization?.id;

  const branchId = activeMembership?.branch?.id;

  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError,
  } = useOrders({
    organizationId,
    branchId,
  });

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const filtered = orders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      if (!matchesStatus) return false;

      if (!searchValue) return true;

      const tableName = order.table?.name?.toLowerCase() ?? "";

      return (
        order.orderNumber.toLowerCase().includes(searchValue) ||
        tableName.includes(searchValue) ||
        order.orderType.toLowerCase().includes(searchValue)
      );
    });

    return [...filtered].sort((a, b) => {
      const aClosed = a.status === "COMPLETED" || a.status === "CANCELLED";

      const bClosed = b.status === "COMPLETED" || b.status === "CANCELLED";

      // Active orders first
      if (aClosed !== bClosed) {
        return aClosed ? 1 : -1;
      }

      // Active = oldest first (FIFO)
      // Closed = newest first
      return aClosed
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [orders, search, statusFilter]);

  if (workspaceLoading || ordersLoading) {
    return (
      <div className="pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
        <p className="text-sm font-medium text-[#6F4E37]">
          We couldn&apos;t load your orders.
        </p>

        <p className="mt-1 text-sm text-[#94877A]">
          Please refresh and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* HEADER */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9A8C80]">
            Café operations
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#2B2118]">
            Orders
          </h1>

          <p className="mt-2 text-sm text-[#817469]">
            Manage orders and keep the counter moving.
          </p>
        </div>

        <Link
          href="/orders/new"
          className="
            inline-flex items-center justify-center gap-2
            rounded-2xl
            bg-[#6F4E37]
            px-4 py-3
            text-sm font-semibold
            text-white
            shadow-sm
            transition-all duration-200
            hover:-translate-y-0.5
            hover:bg-[#5E402D]
          "
        >
          <ShoppingBag className="h-4 w-4" />
          New order
        </Link>
      </section>

      {/* STATUS TABS */}
      <section className="overflow-x-auto">
        <div className="flex min-w-max gap-2 rounded-2xl border border-[#E7DCCE] bg-[#FFFDF9] p-2">
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`
                  rounded-xl
                  px-4 py-2.5
                  text-sm font-medium
                  transition-all duration-150
                  ${
                    active
                      ? "bg-[#6F4E37] text-white shadow-sm"
                      : "text-[#796C61] hover:bg-[#F6EFE7] hover:text-[#2B2118]"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* SEARCH */}
      <section>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8D80]" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order number or table..."
            className="
              h-12 w-full
              rounded-2xl
              border border-[#E7DCCE]
              bg-[#FFFDF9]
              pl-11 pr-4
              text-sm text-[#2B2118]
              outline-none
              transition
              placeholder:text-[#A69A8F]
              focus:border-[#B99A80]
              focus:ring-2
              focus:ring-[#6F4E37]/10
            "
          />
        </div>
      </section>

      {/* ORDER LIST */}
      <section className="space-y-3">
        {filteredOrders.length === 0 ? (
          <EmptyOrders />
        ) : (
          filteredOrders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))
        )}
      </section>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const isPaid = order.paymentStatus === "PAID";

  return (
    <div
      className="
        rounded-[24px]
        border border-[#E7DCCE]
        bg-[#FFFDF9]
        p-4
        shadow-[0_8px_30px_rgba(70,45,25,0.035)]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_14px_35px_rgba(70,45,25,0.07)]
        sm:p-5
      "
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#2B2118]">
              {order.orderNumber}
            </p>

            <StatusBadge status={order.status} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8E8176]">
            <span className="flex items-center gap-1.5">
              {order.orderType === "DINE_IN" ? (
                <Utensils className="h-3.5 w-3.5" />
              ) : (
                <ShoppingBag className="h-3.5 w-3.5" />
              )}

              {order.table?.name ?? order.orderType.replace("_", " ")}
            </span>

            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {itemCount} item
              {itemCount !== 1 ? "s" : ""}
            </span>

            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {formatOrderTime(order.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 lg:justify-end">
          <div>
            <p className="text-lg font-semibold tracking-tight text-[#2B2118]">
              {order.currency}{" "}
              {Number(order.total).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>

            <p
              className={`mt-0.5 text-xs font-medium ${
                isPaid ? "text-[#5F7757]" : "text-[#A46D43]"
              }`}
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
              text-xs font-semibold
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
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-[28px] border border-dashed border-[#DED1C3] bg-[#FFFDF9] px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4ECE4] text-[#6F4E37]">
        <ShoppingBag className="h-5 w-5" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-[#2B2118]">
        No orders found
      </h2>

      <p className="mt-1 text-sm text-[#978A7E]">
        Try another status or search term.
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
