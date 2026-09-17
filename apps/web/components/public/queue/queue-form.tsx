"use client";

import { useState } from "react";
import { Clock3, Phone, UserRound, Users } from "lucide-react";

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

  const canSubmit = !joinQueue.isPending && Boolean(customerName.trim());

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    try {
      const result = await joinQueue.mutateAsync({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        guestCount,
        notes: notes.trim() || undefined,
      });

      onComplete?.(result);
    } catch {
      // Error UI rendered below.
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Guests */}
      <div className="space-y-2">
        <label
          htmlFor="queue-guests"
          className="flex items-center gap-2 text-sm font-medium text-[#2B2118]"
        >
          <Users className="h-4 w-4 text-[#6F4E37]" />
          Guests
        </label>

        <select
          id="queue-guests"
          value={guestCount}
          onChange={(event) => setGuestCount(Number(event.target.value))}
          className="h-12 w-full rounded-xl border border-[#DDD3C8] bg-[#FFFDF9] px-4 text-sm text-[#2B2118] outline-none transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
        >
          {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>
              {count} {count === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>

        <p className="text-xs leading-5 text-[#8A7B6E]">
          Tell us how many people will be joining you.
        </p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label
          htmlFor="queue-name"
          className="flex items-center gap-2 text-sm font-medium text-[#2B2118]"
        >
          <UserRound className="h-4 w-4 text-[#6F4E37]" />
          Name
        </label>

        <input
          id="queue-name"
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
          htmlFor="queue-phone"
          className="flex items-center gap-2 text-sm font-medium text-[#2B2118]"
        >
          <Phone className="h-4 w-4 text-[#6F4E37]" />
          Phone
        </label>

        <input
          id="queue-phone"
          type="tel"
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          className="h-12 w-full rounded-xl border border-[#DDD3C8] bg-[#FFFDF9] px-4 text-sm text-[#2B2118] outline-none placeholder:text-[#A99A8D] transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
          placeholder="09xxxxxxxxx"
        />

        <p className="text-xs leading-5 text-[#8A7B6E]">
          Add your phone number so the café can contact you when needed.
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label
          htmlFor="queue-notes"
          className="flex items-center gap-2 text-sm font-medium text-[#2B2118]"
        >
          <Clock3 className="h-4 w-4 text-[#6F4E37]" />
          Notes
        </label>

        <textarea
          id="queue-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-28 w-full resize-none rounded-xl border border-[#DDD3C8] bg-[#FFFDF9] px-4 py-3 text-sm text-[#2B2118] outline-none placeholder:text-[#A99A8D] transition focus:border-[#6F4E37] focus:ring-2 focus:ring-[#6F4E37]/10"
          placeholder="Optional notes"
        />
      </div>

      {/* Error */}
      {joinQueue.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {joinQueue.error instanceof Error
              ? joinQueue.error.message
              : "Unable to join the waitlist."}
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2B2118] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3A2B20] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {joinQueue.isPending ? "Joining waitlist..." : "Join Waitlist"}
      </button>

      <p className="text-center text-xs leading-5 text-[#9A8A7D]">
        You&apos;ll receive a queue number and a link to track your position.
      </p>
    </form>
  );
}
