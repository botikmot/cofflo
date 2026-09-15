"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type { DashboardTable } from "@/types/dashboard";

import type { CreateTablePayload } from "@/services/tables.service";

type Props = {
  open: boolean;
  table?: DashboardTable | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTablePayload) => Promise<void>;
};

export function TableFormModal({
  open,
  table,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const isEditing = Boolean(table);

  const [name, setName] = useState(table?.name ?? "");

  const [capacity, setCapacity] = useState(String(table?.capacity ?? 4));

  const [location, setLocation] = useState(table?.location ?? "");

  const [photoUrl, setPhotoUrl] = useState(table?.photoUrl ?? "");

  const [customerSelectable, setCustomerSelectable] = useState(
    table?.customerSelectable ?? true,
  );

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    const parsedCapacity = Number(capacity);

    if (!normalizedName) {
      return;
    }

    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
      return;
    }

    await onSubmit({
      name: normalizedName,
      capacity: parsedCapacity,
      location: location.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      customerSelectable,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2118]/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-[0_25px_70px_rgba(43,33,24,0.18)]">
        <div className="flex items-center justify-between border-b border-[#EEE6DD] px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9A8C80]">
              Tables
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#2B2118]">
              {isEditing ? "Edit table" : "Add table"}
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
              Table name
            </label>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Table 1"
              className="mt-2 h-11 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 text-sm text-[#2B2118] outline-none focus:border-[#B99A80]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#5C5047]">
              Capacity
            </label>

            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 text-sm text-[#2B2118] outline-none focus:border-[#B99A80]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#5C5047]">
              Location
            </label>

            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Window side"
              className="mt-2 h-11 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 text-sm text-[#2B2118] outline-none focus:border-[#B99A80]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#5C5047]">
              Photo URL
            </label>

            <input
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
              placeholder="https://..."
              className="mt-2 h-11 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 text-sm text-[#2B2118] outline-none focus:border-[#B99A80]"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E7DCCE] bg-[#FAF6F1] px-3 py-3">
            <input
              type="checkbox"
              checked={customerSelectable}
              onChange={(event) => setCustomerSelectable(event.target.checked)}
              className="h-4 w-4 accent-[#6F4E37]"
            />

            <div>
              <p className="text-sm font-semibold text-[#4B3E35]">
                Allow customer ordering
              </p>

              <p className="mt-0.5 text-xs text-[#93867A]">
                Customers can place orders through this table&apos;s QR code.
              </p>
            </div>
          </label>

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
              {loading ? "Saving..." : isEditing ? "Save changes" : "Add table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
