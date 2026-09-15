"use client";

import Link from "next/link";

type ReservationConfirmationProps = {
  publicToken: string;
};

export function ReservationConfirmation({
  publicToken,
}: ReservationConfirmationProps) {
  return (
    <div className="space-y-5 rounded-2xl border p-6">
      <div>
        <p className="text-sm font-medium text-green-600">
          Reservation received
        </p>

        <h2 className="mt-1 text-2xl font-bold">Your table is reserved!</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Keep your reservation link so you can check the status later.
        </p>
      </div>

      <div className="rounded-xl bg-muted p-4">
        <p className="text-xs text-muted-foreground">Reservation reference</p>

        <p className="mt-1 break-all font-mono text-sm">{publicToken}</p>
      </div>

      <Link
        href={`/public/reservations/${publicToken}`}
        className="block w-full rounded-xl bg-black px-4 py-3 text-center font-medium text-white"
      >
        View reservation
      </Link>
    </div>
  );
}
