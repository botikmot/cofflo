"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type { CreateProductCategoryPayload } from "@/services/product-categories.service";

import type { ProductCategory } from "@/services/products.service";

type Props = {
  open: boolean;
  category?: ProductCategory | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProductCategoryPayload) => Promise<void>;
};

export function CategoryFormModal({
  open,
  category,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const isEditing = Boolean(category);

  const [name, setName] = useState(category?.name ?? "");

  const [description, setDescription] = useState(category?.description ?? "");

  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? 0));

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const parsedSortOrder = Number(sortOrder);

    if (!normalizedName) {
      return;
    }

    if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
      return;
    }

    await onSubmit({
      name: normalizedName,
      description: description.trim() || undefined,
      sortOrder: parsedSortOrder,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2118]/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_25px_70px_rgba(43,33,24,0.18)]">
        <div className="flex items-center justify-between border-b border-[#EEE6DD] px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9A8C80]">
              Menu
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#2B2118]">
              {isEditing ? "Edit category" : "Add category"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8E8176] hover:bg-[#F4ECE4] hover:text-[#6F4E37]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="text-xs font-semibold text-[#5C5047]">
              Category name
            </label>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Coffee"
              className="mt-2 h-11 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 text-sm text-[#2B2118] outline-none focus:border-[#B99A80]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#5C5047]">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Coffee-based drinks"
              className="mt-2 w-full resize-none rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 py-3 text-sm text-[#2B2118] outline-none focus:border-[#B99A80]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#5C5047]">
              Sort order
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 text-sm text-[#2B2118] outline-none focus:border-[#B99A80]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-[#DCCFC1] px-4 text-sm font-medium text-[#6F4E37] hover:bg-[#F7F1EB]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="h-10 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white hover:bg-[#5E402E] disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Add category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
