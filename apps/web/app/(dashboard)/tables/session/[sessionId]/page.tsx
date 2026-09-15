"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Plus,
  ReceiptText,
  Utensils,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { CoffeeLoading } from "@/components/ui/coffee-loading";
import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useTableSession } from "@/hooks/tables/use-table-session";
import { useCloseTableSession } from "@/hooks/tables/use-close-table-session";

function formatCurrency(value: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function TableSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();

  const { activeMembership, isLoading: workspaceLoading } = useWorkspace();

  const organizationId = activeMembership?.organization?.id;
  const branchId = activeMembership?.branch?.id;
  const sessionId = params.sessionId;

  const {
    data: session,
    isLoading: sessionLoading,
    isError,
    error,
  } = useTableSession({
    organizationId,
    branchId,
    sessionId,
  });

  const closeSession = useCloseTableSession({
    organizationId: organizationId!,
    branchId: branchId!,
    tableId: session?.table.id ?? "",
  });

  const orders = session?.orders ?? [];

  const sessionTotal = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total), 0),
    [orders],
  );

  const paidTotal = useMemo(
    () =>
      orders
        .filter((order) => order.paymentStatus === "PAID")
        .reduce((sum, order) => sum + Number(order.total), 0),
    [orders],
  );

  const outstandingTotal = Math.max(sessionTotal - paidTotal, 0);

  const unpaidOrders = orders.filter(
    (order) => order.paymentStatus === "UNPAID" && order.status !== "CANCELLED",
  );

  const canClose =
    session?.status === "OPEN" &&
    unpaidOrders.length === 0 &&
    outstandingTotal <= 0 &&
    !closeSession.isPending;

  async function handleCloseTable() {
    if (!session || !canClose) {
      return;
    }

    const confirmed = window.confirm(
      `Close ${session.table.name}? This will make the table available again.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await closeSession.mutateAsync(session.id);
      router.push("/orders");
    } catch {
      // React Query exposes the error through closeSession.error.
    }
  }

  if (workspaceLoading || sessionLoading) {
    return (
      <div className="pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  if (!activeMembership?.branch || !session || isError) {
    return (
      <div className="space-y-5 pt-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6F4E37]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
          <p className="text-sm font-semibold text-[#6F4E37]">
            We couldn&apos;t load this table session.
          </p>

          <p className="mt-1 text-sm text-[#94877A]">
            {error instanceof Error
              ? error.message
              : "Please refresh and try again."}
          </p>
        </div>
      </div>
    );
  }

  const currency = orders[0]?.currency ?? "PHP";

  return (
    <div className="space-y-6 pt-4 pb-10">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#7C6F64] transition-colors hover:text-[#6F4E37]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0E5D9] text-[#6F4E37]">
              <Utensils className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight text-[#2B2118]">
                  {session.table.name}
                </h1>

                <span
                  className={`
                    rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide
                    ${
                      session.status === "OPEN"
                        ? "bg-[#F0E6DA] text-[#6F4E37]"
                        : "bg-[#E9ECE7] text-[#5F705F]"
                    }
                  `}
                >
                  {session.status}
                </span>
              </div>

              <p className="mt-1 text-sm text-[#85786C]">
                Opened {formatDateTime(session.openedAt)}
              </p>
            </div>
          </div>
        </div>

        <Link
          href={`/orders/new?tableId=${session.table.id}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#5E402E] hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Add order
        </Link>
      </div>

      {/* SESSION SUMMARY */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9A8C80]">
                Orders
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#2B2118]">
                {orders.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4ECE4] text-[#6F4E37]">
              <ReceiptText className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9A8C80]">
                Paid
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#2B2118]">
                {formatCurrency(paidTotal, currency)}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECF3EC] text-[#607560]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#E7DCCE] bg-[#FFFDF9] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9A8C80]">
                Outstanding
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#2B2118]">
                {formatCurrency(outstandingTotal, currency)}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EEE9] text-[#9B604F]">
              <Clock3 className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ORDERS + SIDEBAR */}
      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-10 text-center">
              <ReceiptText className="mx-auto h-7 w-7 text-[#B8A99B]" />

              <p className="mt-3 text-sm font-semibold text-[#5E5248]">
                No orders yet
              </p>

              <p className="mt-1 text-sm text-[#94877A]">
                Add the first order for this table.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const isPaid = order.paymentStatus === "PAID";

              const isCancelled = order.status === "CANCELLED";

              return (
                <div
                  key={order.id}
                  className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-base font-semibold text-[#2B2118] hover:text-[#6F4E37]"
                        >
                          {order.orderNumber}
                        </Link>

                        <span className="rounded-full bg-[#F4ECE4] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#75685D]">
                          {order.status}
                        </span>

                        <span
                          className={`
                            rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide
                            ${
                              isPaid
                                ? "bg-[#ECF3EC] text-[#607560]"
                                : isCancelled
                                  ? "bg-[#F1ECE9] text-[#8A7B71]"
                                  : "bg-[#F8EEE9] text-[#9B604F]"
                            }
                          `}
                        >
                          {isPaid
                            ? "Paid"
                            : isCancelled
                              ? "Cancelled"
                              : "Unpaid"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-[#978A7E]">
                        {formatTime(order.createdAt)}
                      </p>
                    </div>

                    <p className="text-lg font-semibold text-[#2B2118]">
                      {formatCurrency(Number(order.total), order.currency)}
                    </p>
                  </div>

                  <div className="mt-5 divide-y divide-[#EEE6DD] rounded-2xl border border-[#EEE6DD]">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#3A3028]">
                            {item.productName}
                          </p>

                          <p className="mt-0.5 text-xs text-[#978A7E]">
                            {item.quantity} ×{" "}
                            {formatCurrency(
                              Number(item.unitPrice),
                              order.currency,
                            )}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-[#4A3C31]">
                          {formatCurrency(
                            Number(item.subtotal),
                            order.currency,
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  {!isPaid && !isCancelled && (
                    <div className="mt-4 flex justify-end">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCCBBC] bg-[#FAF6F1] px-3.5 text-xs font-semibold text-[#6F4E37] transition-colors hover:bg-[#F3E9DF]"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Record payment
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* SUMMARY SIDEBAR */}
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="rounded-[28px] bg-[#2B2118] p-6 text-[#FFFDF9] shadow-[0_18px_50px_rgba(43,33,24,0.14)]">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#CDB9A5]">
              Table summary
            </p>

            <h2 className="mt-1 text-xl font-semibold">{session.table.name}</h2>

            <div className="mt-6 space-y-3 border-b border-white/10 pb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#CDB9A5]">Session total</span>

                <span className="font-semibold">
                  {formatCurrency(sessionTotal, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#CDB9A5]">Paid</span>

                <span className="font-semibold text-[#B9D0B9]">
                  {formatCurrency(paidTotal, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#CDB9A5]">Outstanding</span>

                <span className="font-semibold text-[#F0C5B8]">
                  {formatCurrency(outstandingTotal, currency)}
                </span>
              </div>
            </div>

            {unpaidOrders.length > 0 ? (
              <div className="mt-5 rounded-2xl border border-[#B36F5D]/20 bg-[#8B4A3C]/15 p-4">
                <div className="flex gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#E5B8A9]" />

                  <div>
                    <p className="text-sm font-semibold text-[#F6DDD5]">
                      Payment still pending
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#D6B9AF]">
                      {unpaidOrders.length} order
                      {unpaidOrders.length !== 1 ? "s" : ""} still need payment
                      before the table can be closed.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-[#8BA08B]/20 bg-white/5 p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#B9D0B9]" />

                  <div>
                    <p className="text-sm font-semibold">Ready to close</p>

                    <p className="mt-1 text-xs leading-5 text-[#CDB9A5]">
                      All active orders are paid.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-2">
              <Link
                href={`/orders/new?tableId=${session.table.id}`}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FFFDF9] text-sm font-semibold text-[#2B2118] transition-colors hover:bg-[#F4ECE4]"
              >
                <Plus className="h-4 w-4" />
                Add order
              </Link>

              <button
                type="button"
                disabled={!canClose}
                onClick={handleCloseTable}
                className="
                  flex h-11 w-full items-center justify-center gap-2
                  rounded-xl border border-white/10
                  bg-white/5
                  text-sm font-semibold
                  transition-colors
                  hover:bg-white/10
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                "
              >
                {closeSession.isPending ? (
                  <>
                    <Clock3 className="h-4 w-4 animate-pulse" />
                    Closing table...
                  </>
                ) : session.status === "CLOSED" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Table closed
                  </>
                ) : canClose ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Close table
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Pay outstanding first
                  </>
                )}
              </button>
            </div>

            {closeSession.isError && (
              <div className="mt-4 rounded-xl bg-[#8B4A3C] px-3 py-2.5 text-xs text-[#FFE8E1]">
                {closeSession.error instanceof Error
                  ? closeSession.error.message
                  : "Unable to close this table."}
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
