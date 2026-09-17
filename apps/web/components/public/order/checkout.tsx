"use client";

import {
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  ShoppingBag,
  Users,
  Utensils,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useCartStore } from "@/stores/cart.store";
import { usePublicTables } from "@/hooks/public/use-public-tables";

type CheckoutProps = {
  branchId: string;
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
  branchId,
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

  const [selectedTableId, setSelectedTableId] = useState("");

  const [notes, setNotes] = useState("");

  const {
    data: tablesData,
    isLoading: isTablesLoading,
    isError: isTablesError,
  } = usePublicTables(branchId, !isQrOrder);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + Number(item.product.price) * item.quantity,
      0,
    );
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const availableTables = tablesData?.tables ?? [];

  const canSubmit =
    !isSubmitting &&
    items.length > 0 &&
    (isQrOrder || orderType === "TAKEOUT" || Boolean(selectedTableId));

  const handleOrderTypeChange = (type: "DINE_IN" | "TAKEOUT") => {
    setOrderType(type);

    if (type === "TAKEOUT") {
      setSelectedTableId("");
    }
  };

  const handleSubmit = () => {
    if (!isQrOrder && orderType === "DINE_IN" && !selectedTableId) {
      return;
    }

    onSubmit({
      orderType: isQrOrder ? "DINE_IN" : orderType,
      tableId:
        !isQrOrder && orderType === "DINE_IN" ? selectedTableId : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="space-y-7">
      {/* Order type */}
      {!isQrOrder ? (
        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A08B76]">
              How would you like your order?
            </p>

            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#2B2118] sm:text-3xl">
              Choose your order type
            </h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Dine-in */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleOrderTypeChange("DINE_IN")}
              className={[
                "relative rounded-3xl border p-5 text-left transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[#6F4E37]/15",
                orderType === "DINE_IN"
                  ? "border-[#6F4E37] bg-[#F8F1E8] shadow-[0_12px_30px_rgba(111,78,55,0.10)]"
                  : "border-[#EDE4D8] bg-white hover:border-[#D5C5B5] hover:shadow-[0_10px_25px_rgba(43,33,24,0.05)]",
                isSubmitting ? "opacity-60" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={[
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    orderType === "DINE_IN"
                      ? "bg-[#6F4E37] text-white"
                      : "bg-[#F3E8DC] text-[#6F4E37]",
                  ].join(" ")}
                >
                  <Utensils className="h-5 w-5" />
                </div>

                {orderType === "DINE_IN" && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6F4E37] text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="mt-5">
                <p className="text-base font-bold text-[#2B2118]">Dine-in</p>

                <p className="mt-1 text-sm leading-6 text-[#8A7866]">
                  Choose a table and enjoy your order here.
                </p>
              </div>
            </button>

            {/* Takeout */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleOrderTypeChange("TAKEOUT")}
              className={[
                "relative rounded-3xl border p-5 text-left transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[#6F4E37]/15",
                orderType === "TAKEOUT"
                  ? "border-[#6F4E37] bg-[#F8F1E8] shadow-[0_12px_30px_rgba(111,78,55,0.10)]"
                  : "border-[#EDE4D8] bg-white hover:border-[#D5C5B5] hover:shadow-[0_10px_25px_rgba(43,33,24,0.05)]",
                isSubmitting ? "opacity-60" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={[
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    orderType === "TAKEOUT"
                      ? "bg-[#6F4E37] text-white"
                      : "bg-[#F3E8DC] text-[#6F4E37]",
                  ].join(" ")}
                >
                  <ShoppingBag className="h-5 w-5" />
                </div>

                {orderType === "TAKEOUT" && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6F4E37] text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="mt-5">
                <p className="text-base font-bold text-[#2B2118]">Takeout</p>

                <p className="mt-1 text-sm leading-6 text-[#8A7866]">
                  Pick up your order when it is ready.
                </p>
              </div>
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-[#E6D7C7] bg-[#F8F1E8] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6F4E37] text-white">
              <Utensils className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A08B76]">
                Dine-in
              </p>

              <p className="mt-1 text-base font-bold text-[#2B2118]">
                {tableName ?? "Selected table"}
              </p>

              <p className="mt-1 text-xs text-[#8A7866]">
                {tableLocation
                  ? tableLocation
                  : "Your table was identified from the QR code."}
              </p>
            </div>

            <div className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6F4E37] text-white">
              <Check className="h-4 w-4" />
            </div>
          </div>
        </section>
      )}

      {/* Table selection */}
      {!isQrOrder && orderType === "DINE_IN" && (
        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A08B76]">
              Seating
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#2B2118]">
              Choose your table
            </h2>

            <p className="mt-1 text-sm text-[#8A7866]">
              Select an available table for your visit.
            </p>
          </div>

          {isTablesLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border border-[#EDE4D8] bg-white"
                >
                  <div className="aspect-[4/3] animate-pulse bg-[#F3ECE4]" />

                  <div className="space-y-3 p-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-[#EEE6DC]" />
                    <div className="h-3 w-32 animate-pulse rounded bg-[#F3ECE4]" />
                  </div>
                </div>
              ))}
            </div>
          ) : isTablesError ? (
            <div className="rounded-3xl border border-[#E7C9C1] bg-[#FCF1EE] p-5">
              <p className="text-sm font-semibold text-[#9B5B4D]">
                Unable to load available tables.
              </p>

              <p className="mt-1 text-xs leading-5 text-[#9B5B4D]/80">
                Please go back and try again.
              </p>
            </div>
          ) : availableTables.length === 0 ? (
            <div className="rounded-3xl border border-[#EDE4D8] bg-white p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3E8DC] text-[#6F4E37]">
                <Utensils className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-bold text-[#2B2118]">
                No tables available right now
              </p>

              <p className="mt-1 text-xs leading-5 text-[#8A7866]">
                Please choose Takeout or try again later.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableTables.map((table) => {
                const selected = selectedTableId === table.id;

                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setSelectedTableId(table.id)}
                    className={[
                      "group overflow-hidden rounded-3xl border text-left transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-[#6F4E37]/15",
                      selected
                        ? "border-[#6F4E37] bg-[#F8F1E8] shadow-[0_12px_30px_rgba(111,78,55,0.10)]"
                        : "border-[#EDE4D8] bg-white hover:-translate-y-0.5 hover:border-[#D5C5B5] hover:shadow-[0_10px_26px_rgba(43,33,24,0.07)]",
                    ].join(" ")}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F3ECE4]">
                      {table.photoUrl ? (
                        <img
                          src={table.photoUrl}
                          alt={table.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8D9CA] text-2xl">
                            ☕
                          </div>
                        </div>
                      )}

                      {selected && (
                        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#6F4E37] text-white shadow-lg">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#2B2118]">
                            {table.name}
                          </p>

                          {table.location && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-[#8A7866]">
                              <MapPin className="h-3 w-3" />
                              {table.location}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#F5EEE7] px-2.5 py-1 text-xs font-semibold text-[#6F4E37]">
                          <Users className="h-3 w-3" />
                          {table.capacity}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-[#8A7866]">
                          {table.capacity}{" "}
                          {table.capacity === 1 ? "seat" : "seats"}
                        </span>

                        <span
                          className={[
                            "text-xs font-bold",
                            selected ? "text-[#6F4E37]" : "text-[#A08B76]",
                          ].join(" ")}
                        >
                          {selected ? "Selected" : "Select table"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Selected table summary */}
      {!isQrOrder && orderType === "DINE_IN" && selectedTableId && (
        <section className="rounded-3xl border border-[#DCC8B6] bg-[#F8F1E8] p-4">
          {(() => {
            const selectedTable = availableTables.find(
              (table) => table.id === selectedTableId,
            );

            if (!selectedTable) {
              return null;
            }

            return (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6F4E37] text-white">
                  <Check className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A08B76]">
                    Selected table
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#2B2118]">
                    {selectedTable.name}
                  </p>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* Notes */}
      <section>
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A08B76]">
            Special instructions
          </p>

          <p className="mt-1 text-sm text-[#8A7866]">
            Optional notes for the café.
          </p>
        </div>

        <textarea
          id="order-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={isSubmitting}
          className="min-h-28 w-full resize-none rounded-2xl border border-[#EDE4D8] bg-white px-4 py-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B5A79A] focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10 disabled:opacity-50"
          placeholder="Example: Less ice, no sugar, extra hot..."
        />
      </section>

      {/* Order summary */}
      <section className="rounded-[1.75rem] border border-[#E6D9CC] bg-[#F8F1E8] p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A08B76]">
              Order summary
            </p>

            <p className="mt-1 text-sm text-[#8A7866]">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>

          <p className="text-2xl font-black text-[#6F4E37]">
            {formatCurrency(subtotal)}
          </p>
        </div>

        <div className="my-5 h-px bg-[#E5D6C7]" />

        <div className="space-y-4">
          {items.map((item) => {
            const itemTotal = Number(item.product.price) * item.quantity;

            return (
              <div
                key={item.product.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2B2118]">
                    {item.product.name}
                  </p>

                  <p className="mt-1 text-xs text-[#8A7866]">
                    {item.quantity} ×{" "}
                    {formatCurrency(Number(item.product.price))}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-bold text-[#6F4E37]">
                  {formatCurrency(itemTotal)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-[#E5D6C7] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#2B2118]">Total</span>

            <span className="text-2xl font-black text-[#6F4E37]">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6F4E37] px-5 py-4 text-sm font-bold text-white shadow-[0_10px_25px_rgba(111,78,55,0.18)] transition hover:bg-[#5D402E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Placing order...
            </>
          ) : (
            <>
              Place order
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>

        {!isQrOrder && orderType === "DINE_IN" && !selectedTableId && (
          <p className="text-center text-xs font-medium text-[#9B5B4D]">
            Select a table to continue.
          </p>
        )}

        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#EDE4D8] bg-white px-5 py-3.5 text-sm font-semibold text-[#6F4E37] transition hover:bg-[#FAF6F1] disabled:opacity-50"
        >
          Back to cart
        </button>
      </div>
    </div>
  );
}
