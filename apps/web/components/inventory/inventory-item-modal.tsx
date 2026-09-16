"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type {
  CreateInventoryItemPayload,
  InventoryItem,
  UpdateInventoryItemPayload,
} from "@/types/inventory";

type Props = {
  item?: InventoryItem | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateInventoryItemPayload | UpdateInventoryItemPayload,
  ) => Promise<void>;
};

export function InventoryItemModal({
  item,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const isEditing = Boolean(item);

  const [name, setName] = useState(item?.name ?? "");
  const [sku, setSku] = useState(item?.sku ?? "");
  const [unit, setUnit] = useState(item?.unit ?? "");
  const [minimumStock, setMinimumStock] = useState(
    item ? String(item.minimumStock) : "",
  );
  const [initialStock, setInitialStock] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedSku = sku.trim();
    const normalizedUnit = unit.trim();

    if (!normalizedName) {
      setError("Item name is required.");
      return;
    }

    if (!normalizedUnit) {
      setError("Unit is required.");
      return;
    }

    const parsedMinimumStock = minimumStock.trim() ? Number(minimumStock) : 0;

    if (!Number.isFinite(parsedMinimumStock) || parsedMinimumStock < 0) {
      setError("Minimum stock must be zero or greater.");
      return;
    }

    if (isEditing) {
      await onSubmit({
        name: normalizedName,
        sku: normalizedSku || undefined,
        unit: normalizedUnit,
        minimumStock: parsedMinimumStock,
      });

      return;
    }

    const parsedInitialStock = initialStock.trim() ? Number(initialStock) : 0;

    if (!Number.isFinite(parsedInitialStock) || parsedInitialStock < 0) {
      setError("Initial stock must be zero or greater.");
      return;
    }

    await onSubmit({
      name: normalizedName,
      sku: normalizedSku || undefined,
      unit: normalizedUnit,
      minimumStock: parsedMinimumStock,
      initialStock: parsedInitialStock,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#E8DED4] bg-[#FFFDF9] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#EDE4DC] px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9A8C80]">
              Inventory
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#2B2118]">
              {isEditing ? "Edit inventory item" : "Add inventory item"}
            </h2>

            <p className="mt-1 text-sm text-[#8B7E74]">
              {isEditing
                ? "Update the item details and stock threshold."
                : "Add an item to this branch's inventory."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8B7E74] transition hover:bg-[#F7F1EB] hover:text-[#4B3E35]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-2xl border border-[#E8C9C1] bg-[#FBF0EB] px-4 py-3 text-sm text-[#8A4A4A]">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="inventory-name"
              className="text-sm font-medium text-[#4B3E35]"
            >
              Item name
            </label>

            <input
              id="inventory-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Coffee beans"
              disabled={loading}
              className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-white px-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B5A79C] focus:border-[#9A7255] focus:ring-2 focus:ring-[#9A7255]/10 disabled:opacity-60"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="inventory-sku"
                className="text-sm font-medium text-[#4B3E35]"
              >
                SKU
              </label>

              <input
                id="inventory-sku"
                value={sku}
                onChange={(event) => setSku(event.target.value)}
                placeholder="BEANS-01"
                disabled={loading}
                className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-white px-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B5A79C] focus:border-[#9A7255] focus:ring-2 focus:ring-[#9A7255]/10 disabled:opacity-60"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="inventory-unit"
                className="text-sm font-medium text-[#4B3E35]"
              >
                Unit
              </label>

              <input
                id="inventory-unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                placeholder="kg, liter, pcs"
                disabled={loading}
                className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-white px-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B5A79C] focus:border-[#9A7255] focus:ring-2 focus:ring-[#9A7255]/10 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="inventory-minimum"
                className="text-sm font-medium text-[#4B3E35]"
              >
                Minimum stock
              </label>

              <input
                id="inventory-minimum"
                type="number"
                min="0"
                step="0.001"
                value={minimumStock}
                onChange={(event) => setMinimumStock(event.target.value)}
                placeholder="0"
                disabled={loading}
                className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-white px-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B5A79C] focus:border-[#9A7255] focus:ring-2 focus:ring-[#9A7255]/10 disabled:opacity-60"
              />
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <label
                  htmlFor="inventory-initial"
                  className="text-sm font-medium text-[#4B3E35]"
                >
                  Initial stock
                </label>

                <input
                  id="inventory-initial"
                  type="number"
                  min="0"
                  step="0.001"
                  value={initialStock}
                  onChange={(event) => setInitialStock(event.target.value)}
                  placeholder="0"
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-[#DCCFC1] bg-white px-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B5A79C] focus:border-[#9A7255] focus:ring-2 focus:ring-[#9A7255]/10 disabled:opacity-60"
                />
              </div>
            )}
          </div>

          {!isEditing && (
            <p className="text-xs leading-5 text-[#9A8C80]">
              Initial stock creates an inventory receipt automatically.
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-[#EDE4DC] pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-4 text-sm font-medium text-[#6F4E37] transition hover:bg-[#F7F1EB] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-xl bg-[#6F4E37] px-5 text-sm font-semibold text-white transition hover:bg-[#5F402D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : isEditing ? "Save changes" : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
