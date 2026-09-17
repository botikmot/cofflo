"use client";

import {
  CheckCircle2,
  Clock3,
  MapPin,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import Link from "next/link";

import { usePublicOrder } from "@/hooks/orders/use-public-order";

type OrderConfirmationProps = {
  orderNumber: string;
  publicToken: string;
};

export function OrderConfirmation({
  orderNumber,
  publicToken,
}: OrderConfirmationProps) {
  const { data: order, isLoading } = usePublicOrder(publicToken);

  const isDineIn = order?.orderType === "DINE_IN";

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Success */}
      <section className="overflow-hidden rounded-[2rem] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_16px_50px_rgba(43,33,24,0.07)]">
        <div className="px-6 pb-8 pt-9 text-center sm:px-10 sm:pt-11">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3EA]">
            <CheckCircle2 className="h-8 w-8 text-[#6C936C]" />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#7DA07D]">
            Order received
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#2B2118] sm:text-4xl">
            Thank you!
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#8A7866]">
            Your order has been sent to the café. We’ll keep you updated as it
            moves forward.
          </p>
        </div>

        {/* Order number */}
        <div className="border-y border-[#EEE5DC] bg-[#F9F5F0] px-6 py-6 text-center sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A08B76]">
            Order number
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-[#2B2118] sm:text-3xl">
            {orderNumber}
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8A7866]">
            <Clock3 className="h-3.5 w-3.5" />
            <span>Order received successfully</span>
          </div>
        </div>

        {/* Order context */}
        {isLoading ? (
          <div className="space-y-3 px-6 py-6 sm:px-10">
            <div className="h-16 animate-pulse rounded-2xl bg-[#F4ECE4]" />
          </div>
        ) : order ? (
          <div className="grid gap-3 px-6 py-6 sm:grid-cols-2 sm:px-10">
            {/* Type */}
            <div className="rounded-2xl border border-[#EDE4D8] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3E8DC] text-[#6F4E37]">
                  {isDineIn ? (
                    <Utensils className="h-4 w-4" />
                  ) : (
                    <ShoppingBag className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-[#A08B76]">Order type</p>

                  <p className="mt-1 text-sm font-bold text-[#2B2118]">
                    {isDineIn ? "Dine-in" : "Takeout"}
                  </p>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-[#EDE4D8] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3E8DC] text-[#6F4E37]">
                  <MapPin className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-[#A08B76]">
                    {isDineIn ? "Table" : "Collection"}
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-[#2B2118]">
                    {isDineIn
                      ? (order.table?.name ?? "Table assigned")
                      : "Takeout"}
                  </p>

                  {isDineIn && order.table?.location && (
                    <p className="mt-0.5 truncate text-xs text-[#8A7866]">
                      {order.table.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* CTA */}
        <div className="px-6 pb-6 sm:px-10 sm:pb-10">
          <Link
            href={`/public/orders/${publicToken}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6F4E37] px-5 py-4 text-sm font-bold text-white shadow-[0_10px_25px_rgba(111,78,55,0.18)] transition hover:bg-[#5D402E]"
          >
            Track your order
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <p className="mt-5 text-center text-xs text-[#A08B76]">
        Keep your order number handy for tracking.
      </p>
    </div>
  );
}
