"use client";

import { useState } from "react";

import { useJoinQueue } from "@/hooks/queue/use-join-queue";
import type { JoinQueueResponse } from "@/types/queue";

type QueueFormProps = {
  branchId: string;
  onComplete?: (result: JoinQueueResponse) => void;
};

export function QueueForm({ branchId, onComplete }: QueueFormProps) {
  const [guestCount, setGuestCount] = useState(2);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  const joinQueue = useJoinQueue(branchId);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const result = await joinQueue.mutateAsync({
        customerName,
        customerPhone: customerPhone || undefined,
        guestCount,
        notes: notes || undefined,
      });

      onComplete?.(result);
    } catch {
      // Error UI is rendered below.
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="queue-guests" className="text-sm font-medium">
          Guests
        </label>

        <select
          id="queue-guests"
          value={guestCount}
          onChange={(event) => setGuestCount(Number(event.target.value))}
          className="w-full rounded-lg border px-3 py-2"
        >
          {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>
              {count} {count === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="queue-name" className="text-sm font-medium">
          Name
        </label>

        <input
          id="queue-name"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Your name"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="queue-phone" className="text-sm font-medium">
          Phone
        </label>

        <input
          id="queue-phone"
          type="tel"
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="09xxxxxxxxx"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="queue-notes" className="text-sm font-medium">
          Notes
        </label>

        <textarea
          id="queue-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-24 w-full rounded-lg border px-3 py-2"
          placeholder="Optional notes"
        />
      </div>

      {joinQueue.isError && (
        <div className="rounded-lg border p-4">
          <p className="text-sm text-destructive">
            {joinQueue.error instanceof Error
              ? joinQueue.error.message
              : "Unable to join the waitlist."}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={joinQueue.isPending}
        className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {joinQueue.isPending ? "Joining waitlist..." : "Join Waitlist"}
      </button>
    </form>
  );
}
