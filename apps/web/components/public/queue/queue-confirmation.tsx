"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ListOrdered,
  TicketCheck,
} from "lucide-react";

type QueueConfirmationProps = {
  publicToken: string;
  queueNumber: number;
};

export function QueueConfirmation({
  publicToken,
  queueNumber,
}: QueueConfirmationProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#E5D9CD] bg-[#FFFDF9] shadow-[0_18px_50px_rgba(66,46,32,0.08)]">
      {/* Hero */}
      <div className="bg-[#F4EDE5] px-6 py-8 text-center sm:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#6F4E37] text-white shadow-sm">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6F4E37]">
          You&apos;re in the waitlist
        </p>

        <h1 className="mt-2 text-5xl font-bold tracking-tight text-[#2B2118] sm:text-6xl">
          #{queueNumber}
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#74665A]">
          Your place in line is saved. Keep your queue link nearby so you can
          check your position anytime.
        </p>
      </div>

      {/* Body */}
      <div className="space-y-5 p-6 sm:p-8">
        {/* Queue reference */}
        <div className="rounded-2xl border border-[#E7DDD3] bg-[#FAF7F3] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9DED3] text-[#6F4E37]">
              <TicketCheck className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8B7A6C]">
                Queue reference
              </p>

              <p className="mt-1 break-all font-mono text-sm font-medium text-[#2B2118]">
                {publicToken}
              </p>
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="rounded-2xl border border-[#E7DDD3] bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0E7DF] text-[#6F4E37]">
              <ListOrdered className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#2B2118]">
                What happens next?
              </p>

              <div className="mt-3 space-y-2.5">
                <p className="text-sm leading-5 text-[#74665A]">
                  Stay nearby and keep an eye on your queue position.
                </p>

                <p className="text-sm leading-5 text-[#74665A]">
                  When a table becomes available, the café can call your number.
                </p>

                <p className="text-sm leading-5 text-[#74665A]">
                  Once you&apos;re seated, your queue status will update.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/public/queue/${publicToken}`}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2B2118] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3A2B20]"
        >
          View Queue Status
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="text-center text-xs leading-5 text-[#9A8A7D]">
          Save your queue link so you can return to your status page later.
        </p>
      </div>
    </div>
  );
}
