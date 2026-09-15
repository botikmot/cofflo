"use client";

import { useMemo } from "react";

import { useCartStore } from "@/stores/cart.store";

type CartProps = {
  currency: string;
  onCheckout: () => void;
};

export function Cart({ currency, onCheckout }: CartProps) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + Number(item.product.price) * item.quantity,
      0,
    );
  }, [items]);

  const formattedSubtotal = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(subtotal);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border p-6 text-center">
        <h2 className="font-semibold">Your cart is empty</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Add something from the menu to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {items.map((item) => {
          const itemTotal = Number(item.product.price) * item.quantity;

          const formattedItemTotal = new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency,
          }).format(itemTotal);

          return (
            <div key={item.product.id} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold">{item.product.name}</h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Intl.NumberFormat("en-PH", {
                      style: "currency",
                      currency,
                    }).format(Number(item.product.price))}{" "}
                    each
                  </p>
                </div>

                <p className="font-semibold">{formattedItemTotal}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => removeItem(item.product.id)}
                  className="text-sm text-destructive"
                >
                  Remove
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border"
                  >
                    −
                  </button>

                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <span className="font-medium">Subtotal</span>

          <span className="text-xl font-bold">{formattedSubtotal}</span>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          className="mt-4 w-full rounded-xl bg-black px-4 py-3 font-medium text-white"
        >
          Continue to Checkout
        </button>
      </div>
    </div>
  );
}
