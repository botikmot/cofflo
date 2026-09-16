"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";

import { reservationService } from "@/services/reservation.service";

import type {
  ReservationTable,
  CreateReservationPayload,
} from "@/types/reservation";

type NewBookingModalProps = {
  open: boolean;
  organizationId: string;
  branchId: string;
  tables?: ReservationTable[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReservationPayload) => Promise<void>;
};

type FormState = {
  customerName: string;
  customerPhone: string;
  guestCount: string;
  date: string;
  startTime: string;
  endTime: string;
  tableId: string;
  notes: string;
};

function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDefaultStartTime() {
  const now = new Date();

  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);

  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
}

function getDefaultEndTime() {
  const now = new Date();

  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15 + 90, 0, 0);

  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
}

function createInitialForm(): FormState {
  return {
    customerName: "",
    customerPhone: "",
    guestCount: "2",
    date: getToday(),
    startTime: getDefaultStartTime(),
    endTime: getDefaultEndTime(),
    tableId: "",
    notes: "",
  };
}

function combineDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function NewBookingModal({
  open,
  organizationId,
  branchId,
  tables: initialTables = [],
  isSubmitting = false,
  onClose,
  onSubmit,
}: NewBookingModalProps) {
  const [form, setForm] = useState<FormState>(createInitialForm);
  const [error, setError] = useState<string | null>(null);

  const [availableTables, setAvailableTables] =
    useState<ReservationTable[]>(initialTables);

  const [isLoadingTables, setIsLoadingTables] = useState(false);

  const guestCount = Number(form.guestCount);

  const availabilityInput = useMemo(() => {
    if (!form.date || !form.startTime || !form.endTime) {
      return null;
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return null;
    }

    const startAt = new Date(combineDateTime(form.date, form.startTime));
    const endAt = new Date(combineDateTime(form.date, form.endTime));

    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      endAt <= startAt
    ) {
      return null;
    }

    return {
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      guestCount,
    };
  }, [form.date, form.startTime, form.endTime, guestCount]);

  useEffect(() => {
    if (!open || !organizationId || !branchId) {
      return;
    }

    if (!availabilityInput) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        setIsLoadingTables(true);
        setError(null);

        const tables = await reservationService.getAvailableTables(
          organizationId,
          branchId,
          availabilityInput,
        );

        if (cancelled) {
          return;
        }

        setAvailableTables(tables);

        setForm((current) => {
          if (
            !current.tableId ||
            tables.some((table) => table.id === current.tableId)
          ) {
            return current;
          }

          return {
            ...current,
            tableId: "",
          };
        });
      } catch (availabilityError) {
        if (cancelled) {
          return;
        }

        setAvailableTables([]);

        setForm((current) => ({
          ...current,
          tableId: "",
        }));

        setError(
          availabilityError instanceof Error
            ? availabilityError.message
            : "Failed to load available tables.",
        );
      } finally {
        if (!cancelled) {
          setIsLoadingTables(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, organizationId, branchId, availabilityInput]);

  const sortedTables = useMemo(() => {
    if (!availabilityInput) {
      return [];
    }

    return [...availableTables].sort((a, b) => {
      if (a.capacity !== b.capacity) {
        return a.capacity - b.capacity;
      }

      return a.name.localeCompare(b.name);
    });
  }, [availableTables, availabilityInput]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!form.customerName.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      setError("Guest count must be at least 1.");
      return;
    }

    const startAt = new Date(combineDateTime(form.date, form.startTime));

    const endAt = new Date(combineDateTime(form.date, form.endTime));

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      setError("Please provide a valid reservation date and time.");
      return;
    }

    if (endAt <= startAt) {
      setError("End time must be later than start time.");
      return;
    }

    if (
      form.tableId &&
      !sortedTables.some((table) => table.id === form.tableId)
    ) {
      setError("The selected table is no longer available.");
      return;
    }

    const payload: CreateReservationPayload = {
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim() || undefined,
      guestCount,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      tableId: form.tableId || undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      await onSubmit(payload);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to create booking.",
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E7DCCE] bg-[#FFFDF9] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EEE6DD] px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9A8C80]">
              Bookings
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[#2B2118]">
              New booking
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8B7E74] transition hover:bg-[#F7F1EB] hover:text-[#6F4E37] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="space-y-5 px-5 py-5">
            {error && (
              <div className="rounded-xl border border-[#F0D2CB] bg-[#FDF0ED] px-4 py-3 text-sm text-[#8A4A4A]">
                {error}
              </div>
            )}

            {/* Customer */}
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-[#2B2118]">
                  Customer
                </h3>

                <p className="mt-0.5 text-xs text-[#8B7E74]">
                  Enter the guest information for this reservation.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Customer name"
                  required
                  value={form.customerName}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      customerName: value,
                    }))
                  }
                  placeholder="e.g. Juan Dela Cruz"
                />

                <Field
                  label="Phone"
                  value={form.customerPhone}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      customerPhone: value,
                    }))
                  }
                  placeholder="e.g. 0917 123 4567"
                />
              </div>
            </section>

            {/* Reservation details */}
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-[#2B2118]">
                  Reservation details
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      date: value,
                    }))
                  }
                  icon={<CalendarDays className="h-4 w-4" />}
                />

                <Field
                  label="Guests"
                  type="number"
                  min="1"
                  required
                  value={form.guestCount}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      guestCount: value,
                    }))
                  }
                  placeholder="2"
                />

                <Field
                  label="Start time"
                  type="time"
                  required
                  value={form.startTime}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      startTime: value,
                    }))
                  }
                  icon={<Clock3 className="h-4 w-4" />}
                />

                <Field
                  label="End time"
                  type="time"
                  required
                  value={form.endTime}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      endTime: value,
                    }))
                  }
                  icon={<Clock3 className="h-4 w-4" />}
                />
              </div>
            </section>

            {/* Table */}
            <section>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#2B2118]">
                    Table
                  </h3>

                  <p className="mt-0.5 text-xs text-[#8B7E74]">
                    Choose a table or leave it on auto-assign.
                  </p>
                </div>

                {isLoadingTables && (
                  <div className="flex items-center gap-1.5 text-xs text-[#8B7E74]">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Checking availability...
                  </div>
                )}
              </div>

              <div className="relative">
                <select
                  value={form.tableId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      tableId: event.target.value,
                    }))
                  }
                  disabled={isLoadingTables}
                  className="h-11 w-full appearance-none rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 pr-9 text-sm text-[#2B2118] outline-none transition focus:border-[#B99A80] focus:ring-2 focus:ring-[#B99A80]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Auto assign table</option>

                  {sortedTables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.name} · {table.capacity} seats
                    </option>
                  ))}
                </select>
              </div>

              {!isLoadingTables &&
                availabilityInput &&
                sortedTables.length === 0 && (
                  <div className="mt-2 rounded-xl border border-[#E7DCCE] bg-[#FAF6F1] px-3 py-2 text-xs text-[#8B7E74]">
                    No suitable tables are available for the selected date,
                    time, and guest count.
                  </div>
                )}
            </section>

            {/* Notes */}
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-[#2B2118]">Notes</h3>
              </div>

              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                rows={3}
                placeholder="Optional notes for the reservation..."
                className="w-full resize-none rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 py-2.5 text-sm text-[#2B2118] outline-none transition placeholder:text-[#A99B8E] focus:border-[#B99A80] focus:ring-2 focus:ring-[#B99A80]/10"
              />
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-[#EEE6DD] bg-[#FFFDF9] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 rounded-xl border border-[#DCCFC1] bg-white px-4 text-sm font-medium text-[#6F4E37] transition hover:bg-[#F7F1EB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isLoadingTables || !availabilityInput}
              className="flex h-10 items-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white transition hover:bg-[#5E402E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  icon?: React.ReactNode;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  min,
  icon,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[#6F6258]">
        {label}
        {required && <span className="ml-0.5 text-[#A56D54]">*</span>}
      </span>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9A8C80]">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          min={min}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#A99B8E] focus:border-[#B99A80] focus:ring-2 focus:ring-[#B99A80]/10 ${
            icon ? "pl-9" : ""
          }`}
        />
      </div>
    </label>
  );
}
