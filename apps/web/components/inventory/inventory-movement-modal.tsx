"use client";

import { useState } from "react";

import type {
  InventoryItem,
  InventoryMovementType,
  CreateInventoryMovementPayload,
} from "@/types/inventory";

type MovementActionType = "IN" | "ADJUSTMENT" | "WASTE";

type InventoryMovementModalProps = {
  item: InventoryItem;
  type: MovementActionType;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateInventoryMovementPayload) => Promise<void> | void;
};

const MOVEMENT_META: Record<
  MovementActionType,
  {
    title: string;
    description: string;
    submitLabel: string;
  }
> = {
  IN: {
    title: "Receive stock",
    description: "Add newly received stock to this inventory item.",
    submitLabel: "Receive stock",
  },

  ADJUSTMENT: {
    title: "Physical stock count",
    description:
      "Enter the actual quantity counted. The adjustment will be calculated automatically.",
    submitLabel: "Save adjustment",
  },

  WASTE: {
    title: "Record waste",
    description: "Record stock that was discarded, spoiled, damaged, or lost.",
    submitLabel: "Record waste",
  },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 3,
  }).format(value);
}

export function InventoryMovementModal({
  item,
  type,
  loading = false,
  onClose,
  onSubmit,
}: InventoryMovementModalProps) {
  const meta = MOVEMENT_META[type];

  const currentStock = Number(item.currentStock);

  const isAdjustment = type === "ADJUSTMENT";

  const isWaste = type === "WASTE";

  const [quantity, setQuantity] = useState("");

  const [actualStock, setActualStock] = useState("");

  const [reason, setReason] = useState("");

  const [reference, setReference] = useState("");

  const [error, setError] = useState<string | null>(null);

  const parsedQuantity = Number(quantity);

  const parsedActualStock = Number(actualStock);

  const difference =
    isAdjustment && actualStock.trim() && Number.isFinite(parsedActualStock)
      ? parsedActualStock - currentStock
      : 0;

  const projectedStock = (() => {
    if (type === "IN") {
      return Number.isFinite(parsedQuantity)
        ? currentStock + parsedQuantity
        : currentStock;
    }

    if (type === "WASTE") {
      return Number.isFinite(parsedQuantity)
        ? currentStock - parsedQuantity
        : currentStock;
    }

    if (type === "ADJUSTMENT") {
      return Number.isFinite(parsedActualStock)
        ? parsedActualStock
        : currentStock;
    }

    return currentStock;
  })();

  function clearError() {
    if (error) {
      setError(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    let movementQuantity = 0;

    /*
     * ---------------------------------------------------------
     * RECEIVE STOCK
     * ---------------------------------------------------------
     */
    if (type === "IN") {
      movementQuantity = Number(quantity);

      if (!quantity.trim()) {
        setError("Quantity is required.");
        return;
      }

      if (!Number.isFinite(movementQuantity) || movementQuantity <= 0) {
        setError("Quantity must be greater than zero.");
        return;
      }
    }

    /*
     * ---------------------------------------------------------
     * WASTE
     * ---------------------------------------------------------
     */
    if (isWaste) {
      movementQuantity = Number(quantity);

      if (!quantity.trim()) {
        setError("Quantity is required.");
        return;
      }

      if (!Number.isFinite(movementQuantity) || movementQuantity <= 0) {
        setError("Quantity must be greater than zero.");
        return;
      }

      if (movementQuantity > currentStock) {
        setError("Waste quantity cannot be greater than current stock.");
        return;
      }
    }

    /*
     * ---------------------------------------------------------
     * PHYSICAL COUNT / ADJUSTMENT
     * ---------------------------------------------------------
     */
    if (isAdjustment) {
      if (!actualStock.trim()) {
        setError("Actual counted stock is required.");
        return;
      }

      if (!Number.isFinite(parsedActualStock) || parsedActualStock < 0) {
        setError("Enter a valid stock count.");
        return;
      }

      movementQuantity = difference;

      if (movementQuantity === 0) {
        setError(
          "There is no difference between current stock and the actual count.",
        );
        return;
      }
    }

    /*
     * ---------------------------------------------------------
     * SAFETY
     * ---------------------------------------------------------
     */
    if (projectedStock < 0) {
      setError("This movement would make stock negative.");
      return;
    }

    /*
     * ---------------------------------------------------------
     * PAYLOAD
     * ---------------------------------------------------------
     *
     * ADJUSTMENT sends the calculated delta:
     *
     * Current = 15
     * Actual  = 13
     * Difference = -2
     *
     * Backend receives:
     * ADJUSTMENT / -2
     */
    const payload: CreateInventoryMovementPayload = {
      type,
      quantity: movementQuantity,
      reason: reason.trim() || undefined,
      reference: reference.trim() || undefined,
    };

    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while saving the stock movement.",
      );
    }
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/40
        px-4
        py-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-lg
          overflow-hidden
          rounded-2xl
          border
          border-[#E8DED2]
          bg-[#FFFDF9]
          shadow-2xl
        "
      >
        {/* HEADER */}
        <div className="border-b border-[#E8DED2] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#2B2118]">
                {meta.title}
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#7B6A5C]">
                {meta.description}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                rounded-lg
                px-2
                py-1
                text-xl
                leading-none
                text-[#8C7A6B]
                transition
                hover:bg-[#F3ECE4]
                hover:text-[#2B2118]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            {/* ITEM SUMMARY */}
            <div
              className="
                rounded-xl
                border
                border-[#E8DED2]
                bg-[#F7F3ED]
                px-4
                py-3
              "
            >
              <div className="text-xs font-medium uppercase tracking-wide text-[#8C7A6B]">
                Inventory item
              </div>

              <div className="mt-1 text-sm font-semibold text-[#2B2118]">
                {item.name}
              </div>

              <div className="mt-1 text-sm text-[#7B6A5C]">
                Current stock:{" "}
                <span className="font-medium text-[#2B2118]">
                  {formatNumber(currentStock)} {item.unit}
                </span>
              </div>
            </div>

            {/* =================================================
                RECEIVE STOCK
               ================================================= */}
            {type === "IN" && (
              <div>
                <label
                  htmlFor="inventory-movement-quantity"
                  className="mb-2 block text-sm font-medium text-[#2B2118]"
                >
                  Quantity <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    id="inventory-movement-quantity"
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={quantity}
                    onChange={(event) => {
                      setQuantity(event.target.value);
                      clearError();
                    }}
                    placeholder="e.g. 10"
                    disabled={loading}
                    autoFocus
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[#DCCFC1]
                      bg-white
                      px-4
                      py-3
                      pr-16
                      text-sm
                      text-[#2B2118]
                      outline-none
                      transition
                      placeholder:text-[#B2A294]
                      focus:border-[#6F4E37]
                      focus:ring-2
                      focus:ring-[#6F4E37]/10
                      disabled:cursor-not-allowed
                      disabled:bg-[#F7F3ED]
                    "
                  />

                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-y-0
                      right-4
                      flex
                      items-center
                      text-sm
                      text-[#8C7A6B]
                    "
                  >
                    {item.unit}
                  </span>
                </div>
              </div>
            )}

            {/* =================================================
                WASTE
               ================================================= */}
            {type === "WASTE" && (
              <div>
                <label
                  htmlFor="inventory-movement-quantity"
                  className="mb-2 block text-sm font-medium text-[#2B2118]"
                >
                  Waste quantity <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    id="inventory-movement-quantity"
                    type="number"
                    step="0.001"
                    min="0.001"
                    max={currentStock}
                    value={quantity}
                    onChange={(event) => {
                      setQuantity(event.target.value);
                      clearError();
                    }}
                    placeholder="e.g. 1"
                    disabled={loading}
                    autoFocus
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[#DCCFC1]
                      bg-white
                      px-4
                      py-3
                      pr-16
                      text-sm
                      text-[#2B2118]
                      outline-none
                      transition
                      placeholder:text-[#B2A294]
                      focus:border-[#6F4E37]
                      focus:ring-2
                      focus:ring-[#6F4E37]/10
                      disabled:cursor-not-allowed
                      disabled:bg-[#F7F3ED]
                    "
                  />

                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-y-0
                      right-4
                      flex
                      items-center
                      text-sm
                      text-[#8C7A6B]
                    "
                  >
                    {item.unit}
                  </span>
                </div>

                <p className="mt-2 text-xs text-[#8C7A6B]">
                  Available:{" "}
                  <span className="font-medium text-[#6F6258]">
                    {formatNumber(currentStock)} {item.unit}
                  </span>
                </p>
              </div>
            )}

            {/* =================================================
                PHYSICAL COUNT
               ================================================= */}
            {isAdjustment && (
              <>
                <div>
                  <label
                    htmlFor="inventory-actual-stock"
                    className="mb-2 block text-sm font-medium text-[#2B2118]"
                  >
                    Actual counted stock <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      id="inventory-actual-stock"
                      type="number"
                      step="0.001"
                      min="0"
                      value={actualStock}
                      onChange={(event) => {
                        setActualStock(event.target.value);
                        clearError();
                      }}
                      placeholder={`e.g. ${currentStock}`}
                      disabled={loading}
                      autoFocus
                      className="
                        w-full
                        rounded-xl
                        border
                        border-[#DCCFC1]
                        bg-white
                        px-4
                        py-3
                        pr-16
                        text-sm
                        text-[#2B2118]
                        outline-none
                        transition
                        placeholder:text-[#B2A294]
                        focus:border-[#6F4E37]
                        focus:ring-2
                        focus:ring-[#6F4E37]/10
                        disabled:cursor-not-allowed
                        disabled:bg-[#F7F3ED]
                      "
                    />

                    <span
                      className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        right-4
                        flex
                        items-center
                        text-sm
                        text-[#8C7A6B]
                      "
                    >
                      {item.unit}
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#8C7A6B]">
                    Enter the quantity you physically counted. Cofflo will
                    calculate the difference automatically.
                  </p>
                </div>

                {actualStock.trim() && Number.isFinite(parsedActualStock) && (
                  <div
                    className="
                        grid
                        gap-3
                        sm:grid-cols-2
                      "
                  >
                    {/* DIFFERENCE */}
                    <div
                      className="
                          rounded-xl
                          border
                          border-[#E8DED2]
                          bg-white
                          px-4
                          py-3
                        "
                    >
                      <div className="text-xs font-medium uppercase tracking-wide text-[#8C7A6B]">
                        Difference
                      </div>

                      <div
                        className={`
                            mt-1
                            text-lg
                            font-semibold
                            ${
                              difference > 0
                                ? "text-emerald-700"
                                : difference < 0
                                  ? "text-amber-700"
                                  : "text-[#6F6258]"
                            }
                          `}
                      >
                        {difference > 0 ? "+" : ""}
                        {formatNumber(difference)} {item.unit}
                      </div>
                    </div>

                    {/* RESULT */}
                    <div
                      className="
                          rounded-xl
                          border
                          border-[#E8DED2]
                          bg-[#F7F3ED]
                          px-4
                          py-3
                        "
                    >
                      <div className="text-xs font-medium uppercase tracking-wide text-[#8C7A6B]">
                        New stock
                      </div>

                      <div className="mt-1 text-lg font-semibold text-[#2B2118]">
                        {formatNumber(projectedStock)} {item.unit}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* REASON */}
            <div>
              <label
                htmlFor="inventory-movement-reason"
                className="mb-2 block text-sm font-medium text-[#2B2118]"
              >
                Reason
              </label>

              <textarea
                id="inventory-movement-reason"
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  clearError();
                }}
                placeholder={
                  type === "IN"
                    ? "e.g. New supplier delivery"
                    : type === "WASTE"
                      ? "e.g. Expired or damaged"
                      : "e.g. Physical stock count"
                }
                rows={3}
                disabled={loading}
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-[#DCCFC1]
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-[#2B2118]
                  outline-none
                  transition
                  placeholder:text-[#B2A294]
                  focus:border-[#6F4E37]
                  focus:ring-2
                  focus:ring-[#6F4E37]/10
                  disabled:cursor-not-allowed
                  disabled:bg-[#F7F3ED]
                "
              />
            </div>

            {/* REFERENCE */}
            <div>
              <label
                htmlFor="inventory-movement-reference"
                className="mb-2 block text-sm font-medium text-[#2B2118]"
              >
                Reference
              </label>

              <input
                id="inventory-movement-reference"
                type="text"
                value={reference}
                onChange={(event) => {
                  setReference(event.target.value);
                  clearError();
                }}
                placeholder="e.g. Delivery receipt, invoice, or note"
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#DCCFC1]
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-[#2B2118]
                  outline-none
                  transition
                  placeholder:text-[#B2A294]
                  focus:border-[#6F4E37]
                  focus:ring-2
                  focus:ring-[#6F4E37]/10
                  disabled:cursor-not-allowed
                  disabled:bg-[#F7F3ED]
                "
              />
            </div>

            {/* ERROR */}
            {error && (
              <div
                className="
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  leading-5
                  text-red-700
                "
              >
                {error}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div
            className="
              flex
              items-center
              justify-end
              gap-3
              border-t
              border-[#E8DED2]
              bg-[#FDF9F4]
              px-6
              py-4
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                rounded-xl
                border
                border-[#DCCFC1]
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-[#5E5147]
                transition
                hover:bg-[#F7F3ED]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                rounded-xl
                bg-[#6F4E37]
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#5E402D]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading ? "Saving..." : meta.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
