"use client";

import { useState } from "react";
import { ArrowLeft, ChefHat, ShoppingBag, Utensils } from "lucide-react";

import { Cart } from "@/components/public/order/cart";
import { Checkout } from "@/components/public/order/checkout";
import { OrderConfirmation } from "@/components/public/order/order-confirmation";
import { PublicMenu } from "@/components/public/order/public-menu";

import { useCreatePublicOrder } from "@/hooks/orders/use-create-public-order";
import { usePublicMenu } from "@/hooks/orders/use-public-menu";
import { usePublicTable } from "@/hooks/public/use-public-table";

import { useCartStore } from "@/stores/cart.store";
import { useParams, useSearchParams } from "next/navigation";

type View = "menu" | "cart" | "checkout" | "confirmation";

export default function PublicOrderPage() {
  const params = useParams<{
    branchId: string;
  }>();

  const branchId = params.branchId;

  const [view, setView] = useState<View>("menu");
  const [orderToken, setOrderToken] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const qrToken = searchParams.get("qrToken");

  const { data: tableData } = usePublicTable(qrToken ?? "");

  const {
    data: menuData,
    isLoading: isMenuLoading,
    isError: isMenuError,
  } = usePublicMenu(branchId);

  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const createOrder = useCreatePublicOrder(branchId);

  const handlePlaceOrder = (payload: {
    orderType: "DINE_IN" | "TAKEOUT";
    tableId?: string;
    notes?: string;
  }) => {
    createOrder.mutate(
      {
        orderType: qrToken ? "DINE_IN" : payload.orderType,
        tableId: payload.tableId,
        notes: payload.notes,
        qrToken: qrToken ?? undefined,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: (order) => {
          setOrderToken(order.publicToken);
          setOrderNumber(order.orderNumber);

          clearCart();
          setView("confirmation");
        },
      },
    );
  };

  /*
   * LOADING
   */
  if (isMenuLoading) {
    return (
      <main className="min-h-screen bg-[#F7F3ED] text-[#2B2118]">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-3xl border border-[#EDE4D8] bg-[#FFFDF9] p-8 text-center shadow-[0_16px_50px_rgba(43,33,24,0.07)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3E8DC]">
              <ChefHat className="h-7 w-7 text-[#6F4E37]" />
            </div>

            <h1 className="text-lg font-bold">Preparing the menu...</h1>

            <p className="mt-2 text-sm leading-6 text-[#8A7866]">
              Give us a moment while we get everything ready.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ERROR
   */
  if (isMenuError || !menuData) {
    return (
      <main className="min-h-screen bg-[#F7F3ED] text-[#2B2118]">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-3xl border border-[#E7C9C1] bg-[#FFFDF9] p-8 text-center shadow-[0_16px_50px_rgba(43,33,24,0.07)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8E8E4]">
              <ChefHat className="h-7 w-7 text-[#9B5B4D]" />
            </div>

            <h1 className="text-xl font-bold">Unable to load menu</h1>

            <p className="mt-2 text-sm leading-6 text-[#8A7866]">
              Please try again later.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ORDER CONFIRMATION
   */
  if (view === "confirmation" && orderToken && orderNumber) {
    return (
      <main className="min-h-screen bg-[#F7F3ED] text-[#2B2118]">
        <div className="mx-auto min-h-screen w-full max-w-6xl bg-[#FFFDF9] shadow-[0_0_60px_rgba(43,33,24,0.06)]">
          <header className="border-b border-[#EDE4D8] bg-[#FFFDF9]">
            <div className="px-5 py-5 sm:px-6 lg:px-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E8DC]">
                  <ChefHat className="h-5 w-5 text-[#6F4E37]" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#2B2118]">
                    {menuData.organization.name}
                  </p>

                  <p className="truncate text-xs text-[#8A7866]">
                    {menuData.branch.name}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="px-5 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-2xl">
              <OrderConfirmation
                orderNumber={orderNumber}
                publicToken={orderToken}
              />
            </div>
          </main>
        </div>
      </main>
    );
  }

  /*
   * CHECKOUT
   */
  if (view === "checkout") {
    return (
      <main className="min-h-screen bg-[#F7F3ED] text-[#2B2118]">
        <div className="mx-auto min-h-screen w-full max-w-6xl bg-[#FFFDF9] shadow-[0_0_60px_rgba(43,33,24,0.06)]">
          <header className="sticky top-0 z-40 border-b border-[#EDE4D8] bg-[#FFFDF9]/95 backdrop-blur">
            <div className="flex items-center gap-3 px-5 py-4 sm:px-6 lg:px-10">
              <button
                type="button"
                onClick={() => setView("cart")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EDE4D8] bg-white text-[#6F4E37] transition hover:border-[#D9C7B6] hover:bg-[#F9F4EE]"
                aria-label="Back to cart"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="min-w-0">
                <p className="text-sm font-bold text-[#2B2118]">Checkout</p>

                <p className="truncate text-xs text-[#8A7866]">
                  {menuData.branch.name}
                </p>
              </div>
            </div>
          </header>

          <main className="px-5 py-6 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-2xl">
              <Checkout
                branchId={branchId}
                currency={menuData.organization.currency}
                isQrOrder={Boolean(qrToken)}
                tableName={tableData?.table.name ?? null}
                tableLocation={tableData?.table.location ?? null}
                onBack={() => setView("cart")}
                onSubmit={handlePlaceOrder}
                isSubmitting={createOrder.isPending}
              />

              {createOrder.isError && (
                <div className="mt-4 rounded-2xl border border-[#E7C9C1] bg-[#FCF1EE] p-4">
                  <p className="text-sm leading-6 text-[#9B5B4D]">
                    {createOrder.error instanceof Error
                      ? createOrder.error.message
                      : "Unable to place your order."}
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </main>
    );
  }

  /*
   * CART
   */
  if (view === "cart") {
    return (
      <main className="min-h-screen bg-[#F7F3ED] text-[#2B2118]">
        <div className="mx-auto min-h-screen w-full max-w-6xl bg-[#FFFDF9] shadow-[0_0_60px_rgba(43,33,24,0.06)]">
          <header className="sticky top-0 z-40 border-b border-[#EDE4D8] bg-[#FFFDF9]/95 backdrop-blur">
            <div className="flex items-center gap-3 px-5 py-4 sm:px-6 lg:px-10">
              <button
                type="button"
                onClick={() => setView("menu")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EDE4D8] bg-white text-[#6F4E37] transition hover:border-[#D9C7B6] hover:bg-[#F9F4EE]"
                aria-label="Back to menu"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="min-w-0">
                <p className="text-sm font-bold text-[#2B2118]">Your order</p>

                <p className="text-xs text-[#8A7866]">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
          </header>

          <main className="px-5 py-6 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-2xl">
              {qrToken && (
                <div className="mb-5 rounded-2xl border border-[#E6D7C7] bg-[#F8F1E8] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6F4E37] text-white">
                      <Utensils className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#2B2118]">
                        Dine-in at Table {tableData?.table.name ?? "—"}
                      </p>

                      <p className="mt-0.5 text-xs text-[#8A7866]">
                        Your order will be served at your table.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A08B76]">
                  Review
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-[#2B2118] sm:text-4xl">
                  Your order
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#8A7866]">
                  Make sure everything looks right before checkout.
                </p>
              </div>

              <Cart
                currency={menuData.organization.currency}
                onCheckout={() => setView("checkout")}
              />
            </div>
          </main>
        </div>
      </main>
    );
  }

  /*
   * MENU
   */
  return (
    <main className="min-h-screen bg-[#F7F3ED] text-[#2B2118]">
      <div className="mx-auto min-h-screen w-full max-w-6xl bg-[#FFFDF9] shadow-[0_0_60px_rgba(43,33,24,0.06)]">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-[#EDE4D8] bg-[#FFFDF9]/95 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3E8DC]">
                <ChefHat className="h-5 w-5 text-[#6F4E37]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#2B2118]">
                  {menuData.organization.name}
                </p>

                <p className="truncate text-xs text-[#8A7866]">
                  {menuData.branch.name}
                </p>
              </div>
            </div>

            {totalItems > 0 && (
              <button
                type="button"
                onClick={() => setView("cart")}
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EDE4D8] bg-white text-[#6F4E37] transition hover:border-[#D9C7B6] hover:bg-[#F9F4EE]"
                aria-label="View cart"
              >
                <ShoppingBag className="h-4 w-4" />

                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6F4E37] px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              </button>
            )}
          </div>
        </header>

        <main className="px-5 pb-32 pt-7 sm:px-6 lg:px-10">
          {/* QR table context */}
          {qrToken && (
            <div className="mb-7 rounded-3xl border border-[#E6D7C7] bg-[#F8F1E8] p-4 shadow-[0_8px_24px_rgba(111,78,55,0.05)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#6F4E37] text-white">
                  <Utensils className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8D6C53]">
                    Dine-in
                  </p>

                  <p className="mt-0.5 truncate text-base font-bold text-[#2B2118]">
                    Table {tableData?.table.name ?? "—"}
                  </p>

                  {tableData?.table.location && (
                    <p className="mt-0.5 truncate text-xs text-[#8A7866]">
                      {tableData.table.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hero */}
          <section className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A08B76]">
              Freshly prepared
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#2B2118] sm:text-4xl lg:text-5xl">
              What are you craving?
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8A7866] sm:text-base">
              Choose your favorites and we’ll prepare them fresh for you.
            </p>
          </section>

          {/* QR context note */}
          {qrToken && (
            <div className="mb-8 flex items-center gap-3 rounded-3xl border border-[#E6D7C7] bg-[#F8F1E8] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6F4E37] text-white">
                <Utensils className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-[#2B2118]">
                  Ordering for your table
                </p>

                <p className="mt-1 text-xs leading-5 text-[#8A7866]">
                  Your order will be linked to Table{" "}
                  {tableData?.table.name ?? "—"}.
                </p>
              </div>
            </div>
          )}

          {/* Menu */}
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A08B76]">
                  Our menu
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#2B2118] sm:text-2xl">
                  Favorites
                </h2>
              </div>

              {totalItems > 0 && (
                <button
                  type="button"
                  onClick={() => setView("cart")}
                  className="text-xs font-semibold text-[#6F4E37] transition hover:text-[#4F3526] sm:text-sm"
                >
                  View cart →
                </button>
              )}
            </div>

            <PublicMenu branchId={branchId} onAdd={addItem} />
          </section>
        </main>

        {/* Sticky Cart */}
        {totalItems > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-50">
            <div className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6 lg:px-10">
              <button
                type="button"
                onClick={() => setView("cart")}
                className="flex w-full items-center justify-between rounded-2xl bg-[#6F4E37] px-4 py-3.5 text-white shadow-[0_16px_40px_rgba(43,33,24,0.22)] transition hover:bg-[#5D402E] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <ShoppingBag className="h-5 w-5" />
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-bold">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </p>

                    <p className="text-xs text-white/70">Review your order</p>
                  </div>
                </div>

                <span className="text-sm font-black">View cart →</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
