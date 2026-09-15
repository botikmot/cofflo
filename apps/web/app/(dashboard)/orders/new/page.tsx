"use client";

import {
  ArrowLeft,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CoffeeLoading } from "@/components/ui/coffee-loading";
import { useWorkspace } from "@/hooks/auth/use-workspace";
import { usePublicMenu } from "@/hooks/orders/use-public-menu";
import { useTables } from "@/hooks/tables/use-tables";
import { useCreateOrder } from "@/hooks/orders/use-create-order";

import type { PublicMenuProduct } from "@/types/menu";
import type { OrderType } from "@/types/order";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTableId = searchParams.get("tableId");

  const { activeMembership, isLoading: workspaceLoading } = useWorkspace();

  const organizationId = activeMembership?.organization?.id;

  const branchId = activeMembership?.branch?.id;

  const [orderType, setOrderType] = useState<OrderType>("DINE_IN");

  const [selectedTableId, setSelectedTableId] = useState(initialTableId ?? "");

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [notes, setNotes] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);

  const {
    data: menu,
    isLoading: menuLoading,
    isError: menuError,
  } = usePublicMenu(branchId ?? "");

  const { data: tables = [], isLoading: tablesLoading } = useTables({
    organizationId,
    branchId,
  });

  const createOrder = useCreateOrder({
    organizationId: organizationId!,
    branchId: branchId!,
  });

  const categories = menu?.categories ?? [];

  const selectedTable = useMemo(() => {
    if (!selectedTableId) {
      return null;
    }

    return (
      tables.find(
        (table) =>
          table.id === selectedTableId &&
          table.isActive &&
          table.status !== "UNAVAILABLE",
      ) ?? null
    );
  }, [tables, selectedTableId]);

  const visibleCategories = useMemo(() => {
    if (!categories.length) {
      return [];
    }

    if (activeCategory) {
      return categories.filter((category) => category.id === activeCategory);
    }

    return categories;
  }, [categories, activeCategory]);

  const visibleProducts = useMemo(() => {
    const products = visibleCategories.flatMap((category) => category.products);

    const value = search.trim().toLowerCase();

    if (!value) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(value) ||
        product.description?.toLowerCase().includes(value),
    );
  }, [visibleCategories, search]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  function addProduct(product: PublicMenuProduct) {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);

      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item.productId !== productId);
      }

      return current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      );
    });
  }

  async function handlePlaceOrder() {
    if (!cart.length || createOrder.isPending) {
      return;
    }

    if (orderType === "DINE_IN" && !selectedTableId) {
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        orderType,
        ...(orderType === "DINE_IN" && selectedTableId
          ? {
              tableId: selectedTableId,
            }
          : {}),
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        ...(notes.trim()
          ? {
              notes: notes.trim(),
            }
          : {}),
      });

      router.push(`/orders/${order.id}`);
    } catch {
      // React Query exposes the error through createOrder.error.
    }
  }

  if (workspaceLoading || menuLoading || tablesLoading) {
    return (
      <div className="pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  if (menuError || !menu || !activeMembership?.branch) {
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
          <p className="text-sm font-medium text-[#6F4E37]">
            We couldn&apos;t load the café menu.
          </p>

          <p className="mt-1 text-sm text-[#94877A]">
            Please refresh and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 pb-10">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#7C6F64] hover:text-[#6F4E37]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#2B2118]">
            New order
          </h1>

          <p className="mt-1 text-sm text-[#85786C]">
            Build an order for {activeMembership.branch.name}.
          </p>
        </div>
      </div>

      {/* ORDER TYPE */}
      <section className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setOrderType("DINE_IN");
            setSelectedTableId("");
          }}
          className={`
            rounded-[22px] border p-5 text-left
            transition-all
            ${
              orderType === "DINE_IN"
                ? "border-[#6F4E37] bg-[#F4ECE4] shadow-sm"
                : "border-[#E7DCCE] bg-[#FFFDF9] hover:bg-[#FAF6F1]"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6F4E37] text-white">
              <Utensils className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#2B2118]">Dine in</p>

              <p className="text-xs text-[#8D8075]">
                Seat the customer at a table
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setOrderType("TAKEOUT");
            setSelectedTableId("");
          }}
          className={`
            rounded-[22px] border p-5 text-left
            transition-all
            ${
              orderType === "TAKEOUT"
                ? "border-[#6F4E37] bg-[#F4ECE4] shadow-sm"
                : "border-[#E7DCCE] bg-[#FFFDF9] hover:bg-[#FAF6F1]"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1E8DE] text-[#6F4E37]">
              <ShoppingBag className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#2B2118]">Takeout</p>

              <p className="text-xs text-[#8D8075]">
                Customer takes the order with them
              </p>
            </div>
          </div>
        </button>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_390px]">
        {/* MENU */}
        <div className="min-w-0">
          <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9A8C80]">
                  Menu
                </p>

                <h2 className="mt-1 text-lg font-semibold text-[#2B2118]">
                  Choose items
                </h2>
              </div>

              <div className="relative w-full sm:max-w-[260px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A39589]" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search menu..."
                  className="h-10 w-full rounded-xl border border-[#E4D9CE] bg-[#FAF6F1] pl-10 pr-3 text-sm outline-none focus:border-[#B99A80]"
                />
              </div>
            </div>

            {/* CATEGORIES */}
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`
                  shrink-0 rounded-xl px-4 py-2 text-xs font-semibold
                  ${
                    activeCategory === null
                      ? "bg-[#6F4E37] text-white"
                      : "bg-[#F4ECE4] text-[#75685D]"
                  }
                `}
              >
                All
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                      shrink-0 rounded-xl px-4 py-2 text-xs font-semibold
                      ${
                        activeCategory === category.id
                          ? "bg-[#6F4E37] text-white"
                          : "bg-[#F4ECE4] text-[#75685D]"
                      }
                    `}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* PRODUCTS */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product)}
                  className="
                      group rounded-[22px]
                      border border-[#E7DCCE]
                      bg-[#FAF6F1]
                      p-4 text-left
                      transition-all duration-200
                      hover:-translate-y-0.5
                      hover:border-[#D2BDA9]
                      hover:bg-[#FFFDF9]
                      hover:shadow-[0_10px_30px_rgba(70,45,25,0.06)]
                    "
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#2B2118]">
                        {product.name}
                      </p>

                      {product.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#95877B]">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 rounded-lg bg-[#F0E5D9] px-2.5 py-1 text-xs font-semibold text-[#6F4E37]">
                      ₱
                      {Number(product.price).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-[#9A8C80]">
                    <Plus className="h-3 w-3" />
                    Add
                  </div>
                </button>
              ))}
            </div>

            {!visibleProducts.length && (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-[#6F6258]">
                  No menu items found.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CART */}
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="rounded-[28px] bg-[#2B2118] p-5 text-[#FFFDF9] shadow-[0_18px_50px_rgba(43,33,24,0.14)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#CDB9A5]">
                  Current order
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  {cart.length} item
                  {cart.length !== 1 ? "s" : ""}
                </h2>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs text-[#CDB9A5] hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                  <ShoppingBag className="mx-auto h-6 w-6 text-[#CDB9A5]" />

                  <p className="mt-3 text-sm font-medium">
                    Your order is empty
                  </p>

                  <p className="mt-1 text-xs text-[#BDAA99]">
                    Add something delicious from the menu.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-[#CDB9A5]">
                          ₱
                          {item.price.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, 0)}
                        className="text-[#BDAA99] hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>

                        <span className="w-5 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-sm font-semibold">
                        ₱
                        {(item.price * item.quantity).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* TABLE */}
            {orderType === "DINE_IN" && (
              <div className="mt-5">
                {initialTableId && selectedTable && (
                  <div className="mb-2 rounded-xl border border-[#E7DCCE] bg-[#F4ECE4] px-3 py-2.5">
                    <p className="text-xs font-semibold text-[#6F4E37]">
                      Adding to existing table
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#8D8075]">
                      This order will be added to the current table session.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#CDB9A5]">
                    Table
                  </label>

                  {selectedTableId && (
                    <button
                      type="button"
                      onClick={() => setSelectedTableId("")}
                      className="text-[11px] font-medium text-[#BDAA99] transition-colors hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  {tables
                    .filter((table) => table.isActive)
                    .map((table) => {
                      const isUnavailable = table.status === "UNAVAILABLE";
                      const isSelected = selectedTableId === table.id;
                      const isOccupied = table.status === "OCCUPIED";

                      return (
                        <button
                          key={table.id}
                          type="button"
                          disabled={isUnavailable}
                          onClick={() => setSelectedTableId(table.id)}
                          className={`
                            rounded-xl border px-3 py-3 text-left transition-all
                            ${
                              isSelected
                                ? "border-[#D8B99A] bg-[#F3E6D9] text-[#2B2118]"
                                : isUnavailable
                                  ? "cursor-not-allowed border-white/5 bg-white/[0.03] text-[#76685C] opacity-50"
                                  : "border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/[0.08]"
                            }
                        `}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold">
                              {table.name}
                            </span>

                            <span
                              className={`
                                h-2 w-2 rounded-full
                                ${
                                  isUnavailable
                                    ? "bg-[#8B8178]"
                                    : isOccupied
                                      ? "bg-[#D6A15D]"
                                      : "bg-[#9FC9A3]"
                                }
                            `}
                            />
                          </div>

                          <p
                            className={`
                            mt-1 text-[10px] font-medium uppercase tracking-wide
                            ${
                              isSelected
                                ? "text-[#7B624D]"
                                : isUnavailable
                                  ? "text-[#76685C]"
                                  : "text-[#BDAA99]"
                            }
                            `}
                          >
                            {isUnavailable
                              ? "Unavailable"
                              : isOccupied
                                ? "Occupied · Add order"
                                : "Available"}
                          </p>
                        </button>
                      );
                    })}
                </div>

                {!tables.some(
                  (table) => table.isActive && table.status !== "UNAVAILABLE",
                ) && (
                  <div className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-[#BDAA99]">
                    No available tables right now.
                  </div>
                )}
              </div>
            )}

            {/* NOTES */}
            <div className="mt-5">
              <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#CDB9A5]">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Special instructions..."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none placeholder:text-[#9F8D7D] focus:border-white/20"
              />
            </div>

            {/* TOTAL */}
            <div className="mt-5 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#CDB9A5]">Estimated total</span>

                <span className="text-2xl font-semibold">
                  ₱
                  {subtotal.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <p className="mt-2 text-[11px] text-[#A99280]">
                Final pricing is calculated by the server.
              </p>
            </div>

            {createOrder.isError && (
              <div className="mt-4 rounded-xl bg-[#6F4036] px-3 py-2.5 text-xs text-[#FFE8E1]">
                {createOrder.error instanceof Error
                  ? createOrder.error.message
                  : "Unable to create order."}
              </div>
            )}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={
                !cart.length ||
                createOrder.isPending ||
                (orderType === "DINE_IN" && !selectedTableId)
              }
              className="
                mt-5 flex w-full items-center
                justify-center gap-2
                rounded-2xl
                bg-[#FFFDF9]
                px-4 py-3.5
                text-sm font-semibold text-[#2B2118]
                transition-all
                hover:bg-[#F4ECE4]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ShoppingBag className="h-4 w-4" />

              {createOrder.isPending ? "Creating order..." : "Place order"}
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
