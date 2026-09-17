"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, TicketCheck } from "lucide-react";

type ReservationConfirmationProps = {
  publicToken: string;
};

export function ReservationConfirmation({
  publicToken,
}: ReservationConfirmationProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#E5D9CD] bg-[#FFFDF9] shadow-[0_18px_50px_rgba(66,46,32,0.08)]">
      <div className="bg-[#F4EDE5] px-6 py-8 text-center sm:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#6F4E37] text-white shadow-sm">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6F4E37]">
          Reservation received
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2B2118] sm:text-3xl">
          Your table is reserved!
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#74665A]">
          Your reservation request has been received. Keep your reservation
          reference so you can check its status anytime.
        </p>
      </div>

      <div className="space-y-5 p-6 sm:p-8">
        <div className="rounded-2xl border border-[#E7DDD3] bg-[#FAF7F3] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9DED3] text-[#6F4E37]">
              <TicketCheck className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8B7A6C]">
                Reservation reference
              </p>

              <p className="mt-1 break-all font-mono text-sm font-medium text-[#2B2118]">
                {publicToken}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E7DDD3] bg-white p-4">
          <p className="text-sm font-semibold text-[#2B2118]">
            What happens next?
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6F4E37] text-[11px] font-semibold text-white">
                1
              </div>

              <p className="text-sm leading-5 text-[#74665A]">
                The café will review your reservation request.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E9DED3] text-[11px] font-semibold text-[#6F4E37]">
                2
              </div>

              <p className="text-sm leading-5 text-[#74665A]">
                Check your reservation page for the latest status.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E9DED3] text-[11px] font-semibold text-[#6F4E37]">
                3
              </div>

              <p className="text-sm leading-5 text-[#74665A]">
                Arrive around your reserved time and enjoy your visit.
              </p>
            </div>
          </div>
        </div>

        <Link
          href={`/public/reservations/${publicToken}`}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2B2118] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3A2B20]"
        >
          View reservation
          <ExternalLink className="h-4 w-4" />
        </Link>

        <p className="text-center text-xs leading-5 text-[#9A8A7D]">
          Save this page or bookmark the reservation link so you can return to
          it later.
        </p>
      </div>
    </div>
  );
}
