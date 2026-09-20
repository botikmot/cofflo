"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Coffee,
  CreditCard,
  MapPin,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { CoffeeLoading } from "@/components/ui/coffee-loading";
import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useOrder } from "@/hooks/orders/use-order";
import { useUpdateOrderStatus } from "@/hooks/orders/use-update-order-status";
import { useRecordPayment } from "@/hooks/orders/use-record-payment";
import { useCurrency } from "@/hooks/settings/use-currency";

import type { OrderStatus, PaymentMethod } from "@/types/order";

const STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function OrderDetailsPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;

  const { currency } = useCurrency();

  const { activeMembership, isLoading: workspaceLoading } = useWorkspace();

  const organizationId = activeMembership?.organization?.id;

  const branchId = activeMembership?.branch?.id;

  const {
    data: order,
    isLoading: orderLoading,
    isError,
  } = useOrder({
    organizationId,
    branchId,
    orderId,
  });

  const updateStatus = useUpdateOrderStatus({
    organizationId: organizationId!,
    branchId: branchId!,
    orderId,
  });

  const recordPayment = useRecordPayment({
    organizationId: organizationId!,
    branchId: branchId!,
    orderId,
  });

  if (workspaceLoading || orderLoading) {
    return (
      <div className="pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-5 pt-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6F4E37] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
          <p className="text-sm font-medium text-[#6F4E37]">
            We couldn&apos;t load this order.
          </p>

          <p className="mt-1 text-sm text-[#94877A]">
            Please go back and try again.
          </p>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const currentOrder = order;
  const isPaid = order.paymentStatus === "PAID";

  const nextStatus = getNextStatus(order.status);

  const canTakePayment = !isPaid && !isCancelled && order.status !== "PENDING";

  async function handleAdvanceStatus() {
    if (!nextStatus || updateStatus.isPending) {
      return;
    }

    await updateStatus.mutateAsync(nextStatus);
  }

  async function handleCancel() {
    if (
      currentOrder.status === "PENDING" ||
      currentOrder.status === "CONFIRMED"
    ) {
      await updateStatus.mutateAsync("CANCELLED");
    }
  }

  async function handlePayment(paymentMethod: PaymentMethod) {
    if (!canTakePayment || recordPayment.isPending) {
      return;
    }

    await recordPayment.mutateAsync({
      paymentMethod,
      amountReceived: Number(currentOrder.total),
    });
  }

  return (
    <div className="space-y-6 pt-4">
      {/* HEADER */}
      <section>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#7C6F64] transition-colors hover:text-[#6F4E37]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9A8C80]">
                Order
              </p>

              <StatusBadge status={order.status} />
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2B2118]">
              {order.orderNumber}
            </h1>

            <p className="mt-2 text-sm text-[#83766B]">
              {formatOrderDate(order.createdAt)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E7DCCE] bg-[#FFFDF9] px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.12em] text-[#9A8D80]">
              Total
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#2B2118]">
              {order.currency}{" "}
              {Number(order.total).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </section>

      {/* STATUS TIMELINE */}
      <StatusTimeline status={order.status} />

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        {/* LEFT */}
        <div className="space-y-5">
          {/* ORDER INFO */}
          <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 shadow-[0_10px_35px_rgba(70,45,25,0.045)] sm:p-6">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-[#6F4E37]" />

              <h2 className="text-lg font-semibold text-[#2B2118]">
                Order details
              </h2>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoCard
                icon={order.orderType === "DINE_IN" ? Utensils : ShoppingBag}
                label="Order type"
                value={order.orderType === "DINE_IN" ? "Dine in" : "Takeout"}
              />

              <InfoCard
                icon={MapPin}
                label="Table"
                value={order.table?.name ?? "Takeout"}
              />

              <InfoCard
                icon={ShoppingBag}
                label="Items"
                value={`${order.items.length} line item${
                  order.items.length !== 1 ? "s" : ""
                }`}
              />

              <InfoCard
                icon={CreditCard}
                label="Payment"
                value={isPaid ? (order.paymentMethod ?? "Paid") : "Unpaid"}
              />
            </div>
          </div>

          {/* ITEMS */}
          <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 shadow-[0_10px_35px_rgba(70,45,25,0.045)] sm:p-6">
            <h2 className="text-lg font-semibold text-[#2B2118]">Items</h2>

            <div className="mt-5 space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-[#FAF6F1] p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#2B2118]">
                      {item.productName}
                    </p>

                    <p className="mt-1 text-xs text-[#918579]">
                      {item.quantity} × {order.currency}{" "}
                      {Number(item.unitPrice).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-[#2B2118]">
                    {order.currency}{" "}
                    {Number(item.subtotal).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* TOTALS */}
          <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 shadow-[0_10px_35px_rgba(70,45,25,0.045)] sm:p-6">
            <div className="space-y-3">
              <SummaryRow
                label="Subtotal"
                value={formatMoney(order.currency, order.subtotal)}
              />

              <SummaryRow
                label="Discount"
                value={`−${formatMoney(order.currency, order.discount)}`}
              />

              <SummaryRow
                label="Tax"
                value={formatMoney(order.currency, order.tax)}
              />

              <div className="my-2 border-t border-[#EEE5DC]" />

              <SummaryRow
                label="Total"
                value={formatMoney(order.currency, order.total)}
                strong
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <aside className="space-y-5">
          {/* ACTIONS */}
          <div className="rounded-[28px] border border-[#E7DCCE] bg-[#2B2118] p-5 text-[#FFFDF9] shadow-[0_16px_40px_rgba(43,33,24,0.14)] sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#CDB9A5]">
              Order actions
            </p>

            <h2 className="mt-1 text-lg font-semibold">Keep things moving</h2>

            <div className="mt-5 space-y-2">
              {nextStatus && (
                <button
                  type="button"
                  onClick={handleAdvanceStatus}
                  disabled={updateStatus.isPending}
                  className="
                    flex w-full items-center justify-center gap-2
                    rounded-2xl
                    bg-[#FFFDF9]
                    px-4 py-3
                    text-sm font-semibold text-[#2B2118]
                    transition
                    hover:bg-[#F4ECE4]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <CheckCircle2 className="h-4 w-4" />

                  {updateStatus.isPending
                    ? "Updating..."
                    : `Mark ${STATUS_LABELS[nextStatus]}`}
                </button>
              )}

              {canTakePayment && (
                <>
                  <button
                    type="button"
                    onClick={() => handlePayment("CASH")}
                    disabled={recordPayment.isPending}
                    className="
                      flex w-full items-center justify-center gap-2
                      rounded-2xl
                      bg-[#6F4E37]
                      px-4 py-3
                      text-sm font-semibold text-white
                      transition
                      hover:bg-[#5E402D]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <CircleDollarSign className="h-4 w-4" />
                    Mark paid — cash
                  </button>

                  {currency === "PHP" && (
                    <button
                      type="button"
                      onClick={() => handlePayment("GCASH")}
                      disabled={recordPayment.isPending}
                      className="
                        flex w-full items-center justify-center gap-2
                        rounded-2xl
                        border border-white/15
                        bg-white/5
                        px-4 py-3
                        text-sm font-semibold text-white
                        transition
                        hover:bg-white/10
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <CreditCard className="h-4 w-4" />
                      Mark paid — GCash
                    </button>
                  )}
                </>
              )}

              {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={updateStatus.isPending}
                  className="
                    w-full rounded-2xl
                    px-4 py-3
                    text-sm font-medium
                    text-[#D7B2A5]
                    transition
                    hover:bg-white/5
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Cancel order
                </button>
              )}
            </div>

            {updateStatus.isError && (
              <p className="mt-3 text-xs text-[#E8B6A7]">
                {updateStatus.error instanceof Error
                  ? updateStatus.error.message
                  : "Unable to update order status."}
              </p>
            )}

            {recordPayment.isError && (
              <p className="mt-3 text-xs text-[#E8B6A7]">
                {recordPayment.error instanceof Error
                  ? recordPayment.error.message
                  : "Unable to record payment."}
              </p>
            )}
          </div>

          {/* PAYMENT */}
          <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 shadow-[0_10px_35px_rgba(70,45,25,0.045)]">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9A8C80]">
              Payment
            </p>

            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#2B2118]">
                  {order.paymentStatus}
                </p>

                <p className="mt-1 text-xs text-[#918579]">
                  {order.paymentMethod
                    ? order.paymentMethod
                    : "No payment recorded"}
                </p>
              </div>

              <div
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isPaid
                    ? "bg-[#E8F1E5] text-[#5F7657]"
                    : "bg-[#FFF3DF] text-[#9A6B2F]"
                }`}
              >
                {isPaid ? "Paid" : "Unpaid"}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function getNextStatus(status: OrderStatus): OrderStatus | null {
  if (status === "PENDING") {
    return "CONFIRMED";
  }

  if (status === "CONFIRMED") {
    return "PREPARING";
  }

  if (status === "PREPARING") {
    return "READY";
  }

  if (status === "READY") {
    return "COMPLETED";
  }

  return null;
}

function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-[28px] border border-[#F1D9D3] bg-[#FFF5F2] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2DDD7]">
            <Clock3 className="h-4 w-4 text-[#995B48]" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#7E4A3B]">
              Order cancelled
            </p>

            <p className="mt-0.5 text-xs text-[#A06B5C]">
              This order can no longer move through the normal flow.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(status);

  return (
    <div className="overflow-x-auto rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 shadow-[0_10px_35px_rgba(70,45,25,0.045)]">
      <div className="flex min-w-[700px] items-center justify-between gap-3">
        {STATUS_FLOW.map((item, index) => {
          const completed = index <= currentIndex;
          const current = item === status;

          return (
            <div key={item} className="flex flex-1 items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    completed
                      ? "bg-[#6F4E37] text-white"
                      : "bg-[#F1E9E1] text-[#A09184]"
                  }`}
                >
                  {completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>

                <div className="whitespace-nowrap">
                  <p
                    className={`text-xs font-semibold ${
                      current ? "text-[#6F4E37]" : "text-[#6D6156]"
                    }`}
                  >
                    {STATUS_LABELS[item]}
                  </p>

                  {current && (
                    <p className="mt-0.5 text-[10px] text-[#A09286]">Current</p>
                  )}
                </div>
              </div>

              {index < STATUS_FLOW.length - 1 && (
                <div
                  className={`mx-3 h-px flex-1 ${
                    index < currentIndex ? "bg-[#6F4E37]" : "bg-[#E8DED2]"
                  }`}
                />
              )}
            </div>
          );
        })}
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

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#FAF6F1] p-4">
      <div className="flex items-center gap-2 text-[#9A8C80]">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-2 text-sm font-semibold text-[#2B2118]">{value}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "text-sm font-semibold text-[#2B2118]"
            : "text-sm text-[#85786C]"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-base font-semibold text-[#2B2118]"
            : "text-sm font-medium text-[#4D4239]"
        }
      >
        {value}
      </span>
    </div>
  );
}

function formatMoney(currency: string, value: string) {
  return `${currency} ${Number(value).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
  })}`;
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
