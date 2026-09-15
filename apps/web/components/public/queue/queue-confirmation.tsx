"use client";

import Link from "next/link";

type QueueConfirmationProps = {
  publicToken: string;
  queueNumber: number;
};

export function QueueConfirmation({
  publicToken,
  queueNumber,
}: QueueConfirmationProps) {
  return (
    <div className="space-y-5 rounded-2xl border p-6 text-center">
      <div>
        <p className="text-sm font-medium text-green-600">
          You’re in the waitlist
        </p>

        <h1 className="mt-1 text-4xl font-bold">#{queueNumber}</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Keep your queue link so you can monitor your position.
        </p>
      </div>

      <div className="rounded-xl bg-muted p-4 text-left">
        <p className="text-xs text-muted-foreground">Queue reference</p>

        <p className="mt-1 break-all font-mono text-sm">{publicToken}</p>
      </div>

      <Link
        href={`/public/queue/${publicToken}`}
        className="block w-full rounded-xl bg-black px-4 py-3 text-center font-medium text-white"
      >
        View Queue Status
      </Link>
    </div>
  );
}
