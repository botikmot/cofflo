"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { usePublicBranch } from "@/hooks/public/use-public-branch";

import { ReservationForm } from "@/components/public/reservation/reservation-form";
import { ReservationConfirmation } from "@/components/public/reservation/reservation-confirmation";
import { QueueForm } from "@/components/public/queue/queue-form";
import { QueueConfirmation } from "@/components/public/queue/queue-confirmation";

type View =
  | "home"
  | "reservation"
  | "confirmation"
  | "queue"
  | "queue-confirmation";

export default function PublicBranchPage() {
  const params = useParams<{
    branchId: string;
  }>();

  const branchId = params.branchId;

  const [view, setView] = useState<View>("home");
  const [reservationToken, setReservationToken] = useState<string | null>(null);
  const [queueToken, setQueueToken] = useState<string | null>(null);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);

  const { data, isLoading, isError } = usePublicBranch(branchId);

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <p className="text-sm text-muted-foreground">Loading café...</p>
        </section>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <div className="rounded-2xl border p-6 text-center">
            <h1 className="text-xl font-bold">Café not found</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              This café branch is unavailable.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (view === "confirmation" && reservationToken) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <ReservationConfirmation publicToken={reservationToken} />
        </section>
      </main>
    );
  }

  if (view === "reservation") {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <button
            type="button"
            onClick={() => setView("home")}
            className="mb-6 text-sm text-muted-foreground"
          >
            ← Back
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">Reserve a Table</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {data.organization.name} · {data.branch.name}
            </p>
          </div>

          <ReservationForm
            branchId={branchId}
            onComplete={(publicToken) => {
              setReservationToken(publicToken);
              setView("confirmation");
            }}
          />
        </section>
      </main>
    );
  }

  if (view === "queue-confirmation" && queueToken && queueNumber !== null) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <QueueConfirmation
            publicToken={queueToken}
            queueNumber={queueNumber}
          />
        </section>
      </main>
    );
  }

  if (view === "queue") {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <button
            type="button"
            onClick={() => setView("home")}
            className="mb-6 text-sm text-muted-foreground"
          >
            ← Back
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">Join Waitlist</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {data.organization.name} · {data.branch.name}
            </p>
          </div>

          <QueueForm
            branchId={branchId}
            onComplete={(result) => {
              setQueueToken(result.publicToken);
              setQueueNumber(result.queueNumber);
              setView("queue-confirmation");
            }}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-md px-4 py-8">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Welcome to</p>

            <h1 className="text-3xl font-bold">{data.organization.name}</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {data.branch.name}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Currency: {data.organization.currency}
            </p>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => setView("reservation")}
              className="rounded-xl border p-4 text-left transition hover:bg-muted"
            >
              <div className="font-semibold">Reserve a Table</div>

              <div className="mt-1 text-sm text-muted-foreground">
                Book a table for a future visit.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setView("queue")}
              className="rounded-xl border p-4 text-left transition hover:bg-muted"
            >
              <div className="font-semibold">Join Waitlist</div>

              <div className="mt-1 text-sm text-muted-foreground">
                Join the queue for a table today.
              </div>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
