"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";

import { useCreateReservation } from "@/hooks/reservations/use-create-reservation";
import { useReservationAvailability } from "@/hooks/reservations/use-reservation-availability";

type ReservationFormProps = {
  branchId: string;
  onComplete?: (publicToken: string) => void;
};

function getLocalDateString() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ReservationForm({
  branchId,
  onComplete,
}: ReservationFormProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [tableId, setTableId] = useState<string>();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  const minDate = getLocalDateString();

  const startAt = useMemo(() => {
    if (!date || !time) {
      return "";
    }

    return new Date(`${date}T${time}:00`).toISOString();
  }, [date, time]);

  const endAt = useMemo(() => {
    if (!date || !time) {
      return "";
    }

    const start = new Date(`${date}T${time}:00`);

    start.setMinutes(start.getMinutes() + 90);

    return start.toISOString();
  }, [date, time]);

  const availabilityParams =
    date && time
      ? {
          branchId,
          startAt,
          endAt,
          guestCount,
        }
      : null;

  const availability = useReservationAvailability(availabilityParams);
  const createReservation = useCreateReservation(branchId);

  const availableTables = availability.data?.tables ?? [];

  const canSubmit =
    !createReservation.isPending &&
    Boolean(date) &&
    Boolean(time) &&
    Boolean(customerName.trim()) &&
    Boolean(availability.data) &&
    availableTables.length > 0;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    try {
      const result = await createReservation.mutateAsync({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        guestCount,
        startAt,
        endAt,
        tableId,
        notes: notes.trim() || undefined,
      });

      onComplete?.(result.publicToken);
    } catch {
      // Error UI handled below.
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Date */}
      <div className="space-y-2">
        <label
          htmlFor="reservation-date"
          className="flex items-center gap-2 text-sm font-medium text-[#2B2118]"
        >
          <CalendarDays className="h-4 w-4 text-[#6F4E37]" />
          Date
        </label>

        <div className="relative">
          <input
            id="reservation-date"
            type="date"
            value={date}
            min={minDate}
            onChange={(event) => {
              setDate(event.target.value);
              setTableId(undefined);
            }}
            className="h-12 w-full rounded-xl border border-[#DDD3C8] bg-[#FFFDF9] px-4 text-sm text-[#2B2118] outline-none transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
            required
          />
        </div>
      </div>

      {/* Time */}
      <div className="space-y-2">
        <label
          htmlFor="reservation-time"
          className="flex items-center gap-2 text-sm font-medium text-[#2B2118]"
        >
          <Clock3 className="h-4 w-4 text-[#6F4E37]" />
          Time
        </label>

        <input
          id="reservation-time"
          type="time"
          value={time}
          onChange={(event) => {
            setTime(event.target.value);
            setTableId(undefined);
          }}
          className="h-12 w-full rounded-xl border border-[#DDD3C8] bg-[#FFFDF9] px-4 text-sm text-[#2B2118] outline-none transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
          required
        />
      </div>

      {/* Guests */}
      <div className="space-y-2">
        <label
          htmlFor="reservation-guests"
          className="flex items-center gap-2 text-sm font-medium text-[#2B2118]"
        >
          <Users className="h-4 w-4 text-[#6F4E37]" />
          Guests
        </label>

        <select
          id="reservation-guests"
          value={guestCount}
          onChange={(event) => {
            setGuestCount(Number(event.target.value));
            setTableId(undefined);
          }}
          className="h-12 w-full rounded-xl border border-[#DDD3C8] bg-[#FFFDF9] px-4 text-sm text-[#2B2118] outline-none transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
        >
          {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>
              {count} {count === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </div>

      {/* Availability */}
      {(availability.isLoading ||
        availability.isError ||
        availability.data) && (
        <div className="space-y-3 rounded-2xl border border-[#E4D8CC] bg-[#FAF7F2] p-4">
          {availability.isLoading && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-[#E8DED4]" />

              <div className="space-y-2">
                <div className="h-3 w-32 animate-pulse rounded bg-[#E8DED4]" />
                <div className="h-2.5 w-48 animate-pulse rounded bg-[#EDE5DC]" />
              </div>
            </div>
          )}

          {availability.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                Unable to check table availability.
              </p>

              <p className="mt-1 text-xs text-red-600">
                Please try again with another date or time.
              </p>
            </div>
          )}

          {availability.data && (
            <>
              <div>
                <p className="text-sm font-semibold text-[#2B2118]">
                  Choose your table
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7B6D61]">
                  Select a preferred table, or let the café assign one for you.
                </p>
              </div>

              {availableTables.length === 0 && (
                <div className="rounded-xl border border-[#E6D8CC] bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-[#2B2118]">
                    No tables available
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#7B6D61]">
                    Try another date, time, or number of guests.
                  </p>
                </div>
              )}

              {availableTables.length > 0 && (
                <div className="space-y-2">
                  {/* Any table */}
                  <label
                    className={[
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition",
                      !tableId
                        ? "border-[#6F4E37] bg-[#F3EAE2] shadow-sm"
                        : "border-[#E1D7CD] bg-white hover:border-[#BDAA99]",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="table"
                      checked={!tableId}
                      onChange={() => setTableId(undefined)}
                      className="mt-1 accent-[#6F4E37]"
                    />

                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#2B2118]">
                        Any available table
                      </div>

                      <div className="mt-1 text-xs leading-5 text-[#7B6D61]">
                        We&apos;ll assign the most suitable table.
                      </div>
                    </div>
                  </label>

                  {availableTables.map((table) => {
                    const selected = tableId === table.id;

                    return (
                      <label
                        key={table.id}
                        className={[
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition",
                          selected
                            ? "border-[#6F4E37] bg-[#F3EAE2] shadow-sm"
                            : "border-[#E1D7CD] bg-white hover:border-[#BDAA99]",
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          name="table"
                          value={table.id}
                          checked={selected}
                          onChange={() => setTableId(table.id)}
                          className="mt-1 accent-[#6F4E37]"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-[#2B2118]">
                              {table.name}
                            </div>

                            {selected && (
                              <span className="rounded-full bg-[#6F4E37] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                                Selected
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#7B6D61]">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {table.capacity} guests
                            </span>

                            <span>•</span>

                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {table.location ?? "Available table"}
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <label
          htmlFor="customer-name"
          className="text-sm font-medium text-[#2B2118]"
        >
          Name
        </label>

        <input
          id="customer-name"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          className="h-12 w-full rounded-xl border border-[#DDD3C8] bg-[#FFFDF9] px-4 text-sm text-[#2B2118] outline-none placeholder:text-[#A99A8D] transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
          placeholder="Your name"
          required
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label
          htmlFor="customer-phone"
          className="text-sm font-medium text-[#2B2118]"
        >
          Phone
        </label>

        <input
          id="customer-phone"
          type="tel"
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          className="h-12 w-full rounded-xl border border-[#DDD3C8] bg-[#FFFDF9] px-4 text-sm text-[#2B2118] outline-none placeholder:text-[#A99A8D] transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
          placeholder="09xxxxxxxxx"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label
          htmlFor="reservation-notes"
          className="text-sm font-medium text-[#2B2118]"
        >
          Notes
        </label>

        <textarea
          id="reservation-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-28 w-full resize-none rounded-xl border border-[#DDD3C8] bg-[#FFFDF9] px-4 py-3 text-sm text-[#2B2118] outline-none placeholder:text-[#A99A8D] transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
          placeholder="Optional notes"
        />
      </div>

      {/* Error */}
      {createReservation.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {createReservation.error instanceof Error
              ? createReservation.error.message
              : "Unable to create reservation."}
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2B2118] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3A2B20] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {createReservation.isPending
          ? "Creating reservation..."
          : "Reserve Table"}
      </button>
    </form>
  );
}
