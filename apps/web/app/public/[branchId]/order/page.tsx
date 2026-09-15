"use client";

import { useState } from "react";

import { Cart } from "@/components/public/order/cart";
import { Checkout } from "@/components/public/order/checkout";
import { OrderConfirmation } from "@/components/public/order/order-confirmation";
import { PublicMenu } from "@/components/public/order/public-menu";

import { useCreatePublicOrder } from "@/hooks/orders/use-create-public-order";
import { usePublicMenu } from "@/hooks/orders/use-public-menu";

import { useCartStore } from "@/stores/cart.store";
import { useParams, useSearchParams } from "next/navigation";
import { usePublicTable } from "@/hooks/public/use-public-table";

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

  console.log("tableData::", tableData);

  const items = useCartStore((state) => state.items);

  const addItem = useCartStore((state) => state.addItem);

  const clearCart = useCartStore((state) => state.clearCart);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const createOrder = useCreatePublicOrder(branchId);

  const handlePlaceOrder = (payload: {
    orderType: "DINE_IN" | "TAKEOUT";
    notes?: string;
  }) => {
    createOrder.mutate(
      {
        orderType: qrToken ? "DINE_IN" : payload.orderType,
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

  if (isMenuLoading) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <p className="text-sm text-muted-foreground">Loading menu...</p>
        </section>
      </main>
    );
  }

  if (isMenuError || !menuData) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <div className="rounded-2xl border p-6 text-center">
            <h1 className="text-xl font-bold">Unable to load menu</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Please try again later.
            </p>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ORDER CONFIRMATION
   */
  if (view === "confirmation" && orderToken && orderNumber) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <OrderConfirmation
            orderNumber={orderNumber}
            publicToken={orderToken}
          />
        </section>
      </main>
    );
  }

  /*
   * CHECKOUT
   */
  if (view === "checkout") {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <Checkout
            currency={menuData.organization.currency}
            isQrOrder={Boolean(qrToken)}
            tableName={tableData?.table.name ?? null}
            tableLocation={tableData?.table.location ?? null}
            onBack={() => setView("cart")}
            onSubmit={handlePlaceOrder}
            isSubmitting={createOrder.isPending}
          />

          {createOrder.isError && (
            <div className="mt-4 rounded-2xl border p-4">
              <p className="text-sm text-destructive">
                {createOrder.error instanceof Error
                  ? createOrder.error.message
                  : "Unable to place your order."}
              </p>
            </div>
          )}
        </section>
      </main>
    );
  }

  /*
   * CART
   */
  if (view === "cart") {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <button
            type="button"
            onClick={() => setView("menu")}
            className="mb-6 text-sm text-muted-foreground"
          >
            ← Back to Menu
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">Your Cart</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>

          <Cart
            currency={menuData.organization.currency}
            onCheckout={() => setView("checkout")}
          />
        </section>
      </main>
    );
  }

  /*
   * MENU
   */
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-md px-4 py-8">
        <div className="space-y-6 pb-24">
          <div>
            <p className="text-sm text-muted-foreground">
              {menuData.organization.name}
            </p>

            <h1 className="text-3xl font-bold">Our Menu</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {menuData.branch.name}
            </p>
          </div>

          <PublicMenu branchId={branchId} onAdd={addItem} />
        </div>

        {totalItems > 0 && (
          <div className="sticky bottom-4">
            <button
              type="button"
              onClick={() => setView("cart")}
              className="w-full rounded-2xl bg-black px-5 py-4 text-sm font-medium text-white shadow-lg"
            >
              View Cart · {totalItems}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
