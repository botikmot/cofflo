"use client";

import { useMemo, useState } from "react";

import { useCreateReservation } from "@/hooks/reservations/use-create-reservation";
import { useReservationAvailability } from "@/hooks/reservations/use-reservation-availability";

type ReservationFormProps = {
  branchId: string;
  onComplete?: (publicToken: string) => void;
};

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

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const result = await createReservation.mutateAsync({
        customerName,
        customerPhone: customerPhone || undefined,
        guestCount,
        startAt,
        endAt,
        tableId,
        notes: notes || undefined,
      });

      onComplete?.(result.publicToken);
    } catch {
      // Error UI will be added below.
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="reservation-date" className="text-sm font-medium">
          Date
        </label>

        <input
          id="reservation-date"
          type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(event) => {
            setDate(event.target.value);
            setTableId(undefined);
          }}
          className="w-full rounded-lg border px-3 py-2"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="reservation-time" className="text-sm font-medium">
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
          className="w-full rounded-lg border px-3 py-2"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="reservation-guests" className="text-sm font-medium">
          Guests
        </label>

        <select
          id="reservation-guests"
          value={guestCount}
          onChange={(event) => {
            setGuestCount(Number(event.target.value));
            setTableId(undefined);
          }}
          className="w-full rounded-lg border px-3 py-2"
        >
          {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>
              {count} {count === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </div>

      {availability.isLoading && (
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Checking available tables...
          </p>
        </div>
      )}

      {availability.isError && (
        <div className="rounded-lg border p-4">
          <p className="text-sm text-destructive">
            Unable to check table availability. Please try again.
          </p>
        </div>
      )}

      {availability.data && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Table</p>

            <p className="text-xs text-muted-foreground">
              You can choose a table or let Cofflo assign the best available
              one.
            </p>
          </div>

          {availability.data.tables.length === 0 && (
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">No tables available</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Try another date, time, or number of guests.
              </p>
            </div>
          )}

          {availability.data.tables.length > 0 && (
            <>
              <label className="flex cursor-pointer gap-3 rounded-lg border p-3">
                <input
                  type="radio"
                  name="table"
                  checked={!tableId}
                  onChange={() => setTableId(undefined)}
                />

                <div>
                  <div className="font-medium">Any available table</div>

                  <div className="text-xs text-muted-foreground">
                    Cofflo will assign the most suitable table.
                  </div>
                </div>
              </label>

              {availability.data.tables.map((table) => (
                <label
                  key={table.id}
                  className="flex cursor-pointer gap-3 rounded-lg border p-3"
                >
                  <input
                    type="radio"
                    name="table"
                    value={table.id}
                    checked={tableId === table.id}
                    onChange={() => setTableId(table.id)}
                  />

                  <div>
                    <div className="font-medium">{table.name}</div>

                    <div className="text-xs text-muted-foreground">
                      {table.location ?? "Available table"} · {table.capacity}{" "}
                      guests
                    </div>
                  </div>
                </label>
              ))}
            </>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="customer-name" className="text-sm font-medium">
          Name
        </label>

        <input
          id="customer-name"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Your name"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="customer-phone" className="text-sm font-medium">
          Phone
        </label>

        <input
          id="customer-phone"
          type="tel"
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="09xxxxxxxxx"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="reservation-notes" className="text-sm font-medium">
          Notes
        </label>

        <textarea
          id="reservation-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-24 w-full rounded-lg border px-3 py-2"
          placeholder="Optional notes"
        />
      </div>

      {createReservation.isError && (
        <div className="rounded-lg border p-4">
          <p className="text-sm text-destructive">
            {createReservation.error instanceof Error
              ? createReservation.error.message
              : "Unable to create reservation."}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={
          createReservation.isPending ||
          !availability.data ||
          availability.data.tables.length === 0
        }
        className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition-opacity disabled:opacity-50"
      >
        {createReservation.isPending
          ? "Creating reservation..."
          : "Reserve Table"}
      </button>
    </form>
  );
}
