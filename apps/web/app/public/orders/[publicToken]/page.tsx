"use client";

import {
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import { useParams } from "next/navigation";

import { usePublicOrder } from "@/hooks/orders/use-public-order";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

const STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

function getOrderStatusMessage(status: string) {
  switch (status) {
    case "PENDING":
      return "Your order has been received and is waiting for confirmation.";

    case "CONFIRMED":
      return "Your order has been confirmed by the café.";

    case "PREPARING":
      return "Your order is being freshly prepared.";

    case "READY":
      return "Your order is ready for you.";

    case "COMPLETED":
      return "Your order has been completed. Thank you!";

    case "CANCELLED":
      return "This order has been cancelled.";

    default:
      return "Your order status has been updated.";
  }
}

function formatStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "CONFIRMED":
      return "Confirmed";

    case "PREPARING":
      return "Preparing";

    case "READY":
      return "Ready";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

function getCurrentStatusIndex(status: string) {
  return STATUS_FLOW.indexOf(status as OrderStatus);
}

export default function PublicOrderPage() {
  const params = useParams<{ publicToken: string }>();

  const publicToken = params.publicToken;

  const { data, isLoading, isError, isFetching } = usePublicOrder(publicToken);

  /*
   * Loading
   */
  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F7F3ED] text-[#2B2118]">
        <div className="mx-auto min-h-screen w-full max-w-5xl bg-[#FFFDF9]">
          <header className="border-b border-[#EDE4D8]">
            <div className="px-5 py-5 sm:px-6 lg:px-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-[#F1E7DC]" />

                <div className="space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#EEE4D9]" />
                  <div className="h-2.5 w-16 animate-pulse rounded bg-[#F3ECE4]" />
                </div>
              </div>
            </div>
          </header>

          <main className="px-5 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="h-4 w-20 animate-pulse rounded bg-[#EEE4D9]" />
              <div className="h-8 w-64 animate-pulse rounded bg-[#E9DED2]" />

              <div className="h-40 animate-pulse rounded-[2rem] bg-[#F1E7DC]" />

              <div className="h-32 animate-pulse rounded-[2rem] bg-[#F1E7DC]" />

              <div className="h-64 animate-pulse rounded-[2rem] bg-[#F1E7DC]" />
            </div>
          </main>
        </div>
      </main>
    );
  }

  /*
   * Error
   */
  if (isError || !data) {
    return (
      <main className="min-h-screen bg-[#F7F3ED] text-[#2B2118]">
        <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-5">
          <div className="w-full max-w-md rounded-[2rem] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center shadow-[0_16px_50px_rgba(43,33,24,0.07)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8E8E4] text-[#9B5B4D]">
              <ShoppingBag className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-xl font-bold">Order not found</h1>

            <p className="mt-2 text-sm leading-6 text-[#8A7866]">
              This order link may be invalid or unavailable.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex(data.status);

  const isCancelled = data.status === "CANCELLED";

  const isDineIn = data.orderType === "DINE_IN";

  const totalItems = data.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const formatMoney = (amount: string) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: data.currency,
    }).format(Number(amount));

  const statusMessage = getOrderStatusMessage(data.status);

  return (
    <main className="min-h-screen bg-[#F7F3ED] text-[#2B2118]">
      <div className="mx-auto min-h-screen w-full max-w-5xl bg-[#FFFDF9] shadow-[0_0_70px_rgba(43,33,24,0.05)]">
        {/* HEADER */}
        <header className="sticky top-0 z-40 border-b border-[#EDE4D8] bg-[#FFFDF9]/95 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3E8DC] text-[#6F4E37]">
                <ShoppingBag className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#2B2118]">
                  {data.branch?.organization?.name ?? "Your order"}
                </p>

                <p className="truncate text-xs text-[#8A7866]">
                  {data.branch?.name ?? "Café order"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#EDE4D8] bg-white px-3 py-1.5">
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  isFetching ? "animate-pulse bg-[#6F4E37]" : "bg-[#7DA07D]",
                ].join(" ")}
              />

              <span className="text-[11px] font-semibold text-[#7D7065]">
                Live updates
              </span>
            </div>
          </div>
        </header>

        <main className="px-5 pb-12 pt-7 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-3xl">
            {/* ORDER HEADER */}
            <section className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A08B76]">
                Order
              </p>

              <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-[#2B2118] sm:text-4xl">
                    {data.orderNumber}
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-[#8A7866]">
                    We’ll keep this page updated while your order moves through
                    the café.
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl border border-[#E7DCCE] bg-white px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A08B76]">
                    Total
                  </p>

                  <p className="mt-1 text-xl font-black text-[#6F4E37]">
                    {formatMoney(data.total)}
                  </p>
                </div>
              </div>
            </section>

            {/* CURRENT STATUS */}
            <section
              className={[
                "overflow-hidden rounded-[2rem] border p-6 shadow-[0_12px_36px_rgba(43,33,24,0.06)] sm:p-7",
                isCancelled
                  ? "border-[#E9D2CC] bg-[#FFF6F3]"
                  : "border-[#E6D7C7] bg-[#F8F1E8]",
              ].join(" ")}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div
                  className={[
                    "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl",
                    isCancelled
                      ? "bg-[#F2DDD7] text-[#995B48]"
                      : "bg-[#6F4E37] text-white",
                  ].join(" ")}
                >
                  {isCancelled ? (
                    <Clock3 className="h-7 w-7" />
                  ) : data.status === "COMPLETED" ? (
                    <CheckCircle2 className="h-7 w-7" />
                  ) : (
                    <Clock3 className="h-7 w-7" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A08B76]">
                    Current status
                  </p>

                  <h2
                    className={[
                      "mt-1 text-2xl font-black tracking-tight",
                      isCancelled ? "text-[#995B48]" : "text-[#2B2118]",
                    ].join(" ")}
                  >
                    {formatStatus(data.status)}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#8A7866]">
                    {statusMessage}
                  </p>
                </div>
              </div>
            </section>

            {/* STATUS TIMELINE */}
            {!isCancelled && (
              <section className="mt-6 rounded-[2rem] border border-[#E7DCCE] bg-white p-5 shadow-[0_10px_30px_rgba(43,33,24,0.04)] sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A08B76]">
                      Order progress
                    </p>

                    <p className="mt-1 text-sm text-[#8A7866]">
                      Your order will move through these stages.
                    </p>
                  </div>

                  <span className="rounded-full bg-[#F5EEE7] px-3 py-1.5 text-[11px] font-semibold text-[#6F4E37]">
                    {Math.max(
                      1,
                      Math.min(STATUS_FLOW.length, currentStatusIndex + 1),
                    )}
                    /{STATUS_FLOW.length}
                  </span>
                </div>

                <div className="mt-7 overflow-x-auto pb-1">
                  <div className="min-w-[640px]">
                    <div className="flex items-start">
                      {STATUS_FLOW.map((status, index) => {
                        const completed = index <= currentStatusIndex;

                        const current = status === data.status;

                        return (
                          <div
                            key={status}
                            className="flex min-w-0 flex-1 items-start"
                          >
                            <div className="flex flex-col items-center">
                              <div
                                className={[
                                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition",
                                  completed
                                    ? "border-[#6F4E37] bg-[#6F4E37] text-white"
                                    : "border-[#E4D7CA] bg-[#F8F3EE] text-[#AB9C8F]",
                                  current ? "ring-4 ring-[#6F4E37]/10" : "",
                                ].join(" ")}
                              >
                                {completed ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <span className="text-xs font-bold">
                                    {index + 1}
                                  </span>
                                )}
                              </div>

                              <p
                                className={[
                                  "mt-3 text-center text-xs font-semibold",
                                  current
                                    ? "text-[#6F4E37]"
                                    : completed
                                      ? "text-[#5F5147]"
                                      : "text-[#A39589]",
                                ].join(" ")}
                              >
                                {formatStatus(status)}
                              </p>
                            </div>

                            {index < STATUS_FLOW.length - 1 && (
                              <div
                                className={[
                                  "mt-5 h-0.5 flex-1",
                                  index < currentStatusIndex
                                    ? "bg-[#6F4E37]"
                                    : "bg-[#E8DED4]",
                                ].join(" ")}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ORDER CONTEXT */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-[#E7DCCE] bg-white p-5 shadow-[0_8px_26px_rgba(43,33,24,0.04)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3E8DC] text-[#6F4E37]">
                    {isDineIn ? (
                      <Utensils className="h-5 w-5" />
                    ) : (
                      <ShoppingBag className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A08B76]">
                      Order type
                    </p>

                    <p className="mt-1 text-base font-bold text-[#2B2118]">
                      {isDineIn ? "Dine-in" : "Takeout"}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#8A7866]">
                      {isDineIn
                        ? "Enjoy your order at the café."
                        : "Pick up your order when it is ready."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-[#E7DCCE] bg-white p-5 shadow-[0_8px_26px_rgba(43,33,24,0.04)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3E8DC] text-[#6F4E37]">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A08B76]">
                      {isDineIn ? "Table" : "Pickup"}
                    </p>

                    <p className="mt-1 text-base font-bold text-[#2B2118]">
                      {isDineIn
                        ? (data.table?.name ?? "Table selected")
                        : "Takeout"}
                    </p>

                    {isDineIn && data.table?.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#8A7866]">
                        <MapPin className="h-3 w-3" />
                        {data.table.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ITEMS */}
            <section className="mt-6 rounded-[2rem] border border-[#E7DCCE] bg-white p-5 shadow-[0_10px_30px_rgba(43,33,24,0.04)] sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A08B76]">
                    Your order
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#2B2118]">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </h2>
                </div>
              </div>

              <div className="mt-5 divide-y divide-[#EEE5DC]">
                {data.items.map((item, index) => (
                  <div
                    key={`${item.productName}-${index}`}
                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5EEE7] text-xs font-bold text-[#6F4E37]">
                        {item.quantity}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#2B2118]">
                          {item.productName}
                        </p>

                        <p className="mt-1 text-xs text-[#8A7866]">
                          {item.quantity} × {formatMoney(item.unitPrice)}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-[#6F4E37]">
                      {formatMoney(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-[#F8F1E8] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#5A4C42]">
                    Total
                  </span>

                  <span className="text-xl font-black text-[#6F4E37]">
                    {formatMoney(data.total)}
                  </span>
                </div>
              </div>
            </section>

            {/* PAYMENT */}
            <section className="mt-6 rounded-[2rem] border border-[#E7DCCE] bg-white p-5 shadow-[0_10px_30px_rgba(43,33,24,0.04)] sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A08B76]">
                    Payment
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#2B2118]">
                    {data.paymentStatus === "PAID"
                      ? "Payment received"
                      : "Payment not recorded yet"}
                  </p>
                </div>

                <span
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-semibold",
                    data.paymentStatus === "PAID"
                      ? "bg-[#E8F1E5] text-[#5F7657]"
                      : "bg-[#FFF3DF] text-[#9A6B2F]",
                  ].join(" ")}
                >
                  {data.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
                </span>
              </div>
            </section>

            {/* LIVE UPDATE FOOTER */}
            {!isCancelled && (
              <div className="mt-6 flex items-center justify-center gap-2 text-center">
                <RefreshCw
                  className={[
                    "h-3.5 w-3.5 text-[#A08B76]",
                    isFetching ? "animate-spin" : "",
                  ].join(" ")}
                />

                <p className="text-xs text-[#A08B76]">
                  This page checks for order updates automatically.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </main>
  );
}
