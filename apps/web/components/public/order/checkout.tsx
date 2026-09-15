"use client";

import { useMemo, useState } from "react";

import { useCartStore } from "@/stores/cart.store";

type CheckoutProps = {
  currency: string;
  isQrOrder?: boolean;
  tableName?: string | null;
  tableLocation?: string | null;
  onBack: () => void;
  onSubmit: (payload: {
    orderType: "DINE_IN" | "TAKEOUT";
    tableId?: string;
    notes?: string;
  }) => void;
  isSubmitting?: boolean;
};

export function Checkout({
  currency,
  isQrOrder = false,
  tableName,
  tableLocation,
  onBack,
  onSubmit,
  isSubmitting = false,
}: CheckoutProps) {
  const items = useCartStore((state) => state.items);

  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEOUT">("DINE_IN");

  const [notes, setNotes] = useState("");

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + Number(item.product.price) * item.quantity,
      0,
    );
  }, [items]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const handleSubmit = () => {
    onSubmit({
      orderType: isQrOrder ? "DINE_IN" : orderType,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        disabled={isSubmitting}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        ← Back to Cart
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Checkout</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Review your order before placing it.
        </p>
      </div>

      {/* Order Type */}
      {isQrOrder ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Order type</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Your table was identified from the QR code.
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <div className="font-medium">Dine-in</div>

            <p className="mt-1 text-sm text-muted-foreground">
              {tableName ?? "Selected table"}
              {tableLocation ? ` · ${tableLocation}` : ""}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium">Order type</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setOrderType("DINE_IN")}
              className={`rounded-xl border p-4 text-left transition ${
                orderType === "DINE_IN" ? "border-black" : "hover:bg-muted"
              } disabled:opacity-50`}
            >
              <div className="font-medium">Dine-in</div>

              <p className="mt-1 text-xs text-muted-foreground">
                Enjoy your order at the café.
              </p>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setOrderType("TAKEOUT")}
              className={`rounded-xl border p-4 text-left transition ${
                orderType === "TAKEOUT" ? "border-black" : "hover:bg-muted"
              } disabled:opacity-50`}
            >
              <div className="font-medium">Takeout</div>

              <p className="mt-1 text-xs text-muted-foreground">
                Take your order with you.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Dine-in without QR */}
      {!isQrOrder && orderType === "DINE_IN" && (
        <div className="rounded-xl border p-4">
          <p className="font-medium">No table selected</p>

          <p className="mt-1 text-sm text-muted-foreground">
            You can place the order first and choose a table later.
          </p>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <label htmlFor="order-notes" className="text-sm font-medium">
          Notes
        </label>

        <textarea
          id="order-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={isSubmitting}
          className="min-h-24 w-full resize-none rounded-lg border px-3 py-2 outline-none transition focus:ring-2 disabled:opacity-50"
          placeholder="Optional notes"
        />
      </div>

      {/* Order Summary */}
      <div className="rounded-2xl border p-5">
        <div>
          <p className="font-medium">Order summary</p>

          <p className="mt-1 text-xs text-muted-foreground">
            {items.reduce((total, item) => total + item.quantity, 0)}{" "}
            {items.reduce((total, item) => total + item.quantity, 0) === 1
              ? "item"
              : "items"}
          </p>
        </div>

        <div className="mt-4 space-y-4">
          {items.map((item) => {
            const itemTotal = Number(item.product.price) * item.quantity;

            return (
              <div
                key={item.product.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.product.name}</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.quantity} ×{" "}
                    {formatCurrency(Number(item.product.price))}
                  </p>
                </div>

                <p className="shrink-0 font-medium">
                  {formatCurrency(itemTotal)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-5 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total</span>

            <span className="text-xl font-bold">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        disabled={isSubmitting || items.length === 0}
        onClick={handleSubmit}
        className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
}
