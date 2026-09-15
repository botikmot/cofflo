"use client";

import Link from "next/link";

type OrderConfirmationProps = {
  orderNumber: string;
  publicToken: string;
};

export function OrderConfirmation({
  orderNumber,
  publicToken,
}: OrderConfirmationProps) {
  return (
    <div className="space-y-6 rounded-2xl border p-6 text-center">
      <div>
        <p className="text-sm font-medium text-green-600">Order received</p>

        <h1 className="mt-1 text-3xl font-bold">Thank you!</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Your order has been sent to the café.
        </p>
      </div>

      <div className="rounded-2xl bg-muted p-5">
        <p className="text-xs text-muted-foreground">Order number</p>

        <p className="mt-1 text-2xl font-bold">{orderNumber}</p>
      </div>

      <Link
        href={`/public/orders/${publicToken}`}
        className="block w-full rounded-xl bg-black px-4 py-3 text-center font-medium text-white"
      >
        Track Order
      </Link>
    </div>
  );
}
