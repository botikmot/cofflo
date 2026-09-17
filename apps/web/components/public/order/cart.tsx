"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency,
    }).format(amount);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] border border-[#EDE4D8] bg-white p-8 text-center shadow-[0_8px_30px_rgba(43,33,24,0.05)] sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3E8DC] text-[#6F4E37]">
          <ShoppingBag className="h-7 w-7" />
        </div>

        <h2 className="mt-5 text-xl font-bold text-[#2B2118]">
          Your cart is empty
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8A7866]">
          Add something delicious from the menu to continue with your order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Cart items */}
      <div className="space-y-4">
        {items.map((item) => {
          const unitPrice = Number(item.product.price);
          const itemTotal = unitPrice * item.quantity;

          return (
            <article
              key={item.product.id}
              className="overflow-hidden rounded-[1.75rem] border border-[#EDE4D8] bg-white shadow-[0_6px_24px_rgba(43,33,24,0.045)] transition hover:shadow-[0_10px_28px_rgba(43,33,24,0.07)]"
            >
              <div className="flex gap-4 p-4 sm:gap-5 sm:p-5">
                {/* Product image */}
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#F3ECE4] sm:h-28 sm:w-28">
                  {"imageUrl" in item.product &&
                  typeof item.product.imageUrl === "string" &&
                  item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8D9CA] text-xl">
                        ☕
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-bold text-[#2B2118] sm:text-base">
                        {item.product.name}
                      </h3>

                      <p className="mt-1 text-xs text-[#8A7866] sm:text-sm">
                        {formatCurrency(unitPrice)} each
                      </p>
                    </div>

                    <p className="shrink-0 text-base font-black text-[#6F4E37] sm:text-lg">
                      {formatCurrency(itemTotal)}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9B5B4D] transition hover:text-[#7D4338] sm:text-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>

                    {/* Quantity */}
                    <div className="flex items-center rounded-full border border-[#E4D8CC] bg-[#FCF9F5] p-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#6F4E37] transition hover:bg-[#F0E5D9] active:scale-95 disabled:opacity-40"
                        disabled={item.quantity <= 1}
                        aria-label={`Decrease ${item.product.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <span className="min-w-8 px-1 text-center text-sm font-bold text-[#2B2118]">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#6F4E37] transition hover:bg-[#F0E5D9] active:scale-95"
                        aria-label={`Increase ${item.product.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Summary */}
      <section className="rounded-[1.75rem] border border-[#E6D9CC] bg-[#F8F1E8] p-5 shadow-[0_8px_28px_rgba(111,78,55,0.05)] sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A08B76]">
              Order total
            </p>

            <p className="mt-1 text-sm text-[#8A7866]">
              {items.reduce((total, item) => total + item.quantity, 0)}{" "}
              {items.reduce((total, item) => total + item.quantity, 0) === 1
                ? "item"
                : "items"}
            </p>
          </div>

          <p className="text-2xl font-black tracking-tight text-[#6F4E37] sm:text-3xl">
            {formatCurrency(subtotal)}
          </p>
        </div>

        <div className="my-5 h-px bg-[#E5D6C7]" />

        <button
          type="button"
          onClick={onCheckout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6F4E37] px-5 py-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(111,78,55,0.18)] transition hover:bg-[#5D402E] hover:shadow-[0_12px_28px_rgba(111,78,55,0.22)] active:scale-[0.99]"
        >
          Continue to Checkout
          <span aria-hidden="true">→</span>
        </button>

        <p className="mt-3 text-center text-xs text-[#8A7866]">
          Review your order before placing it.
        </p>
      </section>
    </div>
  );
}
