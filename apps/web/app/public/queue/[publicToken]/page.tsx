"use client";

import { useParams } from "next/navigation";

import { usePublicQueue } from "@/hooks/queue/use-public-queue";

function getQueueMessage(status: string) {
  switch (status) {
    case "WAITING":
      return "Please stay nearby. We’ll call you when a suitable table is ready.";

    case "CALLED":
      return "Your table is ready. Please proceed to the café.";

    case "SEATED":
      return "You are seated. Enjoy your time at the café!";

    case "CANCELLED":
      return "This waitlist entry has been cancelled.";

    case "NO_SHOW":
      return "This waitlist entry was marked as a no-show.";

    default:
      return "Your queue status has been updated.";
  }
}

export default function PublicQueuePage() {
  const params = useParams<{ publicToken: string }>();

  const publicToken = params.publicToken;

  const { data, isLoading, isError } = usePublicQueue(publicToken);

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <p className="text-sm text-muted-foreground">Loading queue...</p>
        </section>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <div className="rounded-2xl border p-6 text-center">
            <h1 className="text-xl font-bold">Queue entry not found</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              This queue link may be invalid or no longer available.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-md px-4 py-8">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {data.branch.organization.name}
            </p>

            <h1 className="text-2xl font-bold">Waitlist</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {data.branch.name}
            </p>
          </div>

          <div className="rounded-2xl border p-6 text-center">
            <p className="text-sm text-muted-foreground">Queue number</p>

            <p className="mt-1 text-5xl font-bold">#{data.queueNumber}</p>
          </div>

          {data.status === "WAITING" && data.position !== null && (
            <div className="rounded-2xl border p-6 text-center">
              <p className="text-sm text-muted-foreground">Your position</p>

              <p className="mt-1 text-4xl font-bold">{data.position}</p>
            </div>
          )}

          <div className="rounded-2xl border p-5">
            <p className="text-sm font-bold">{data.status}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {getQueueMessage(data.status)}
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border p-5">
            <div>
              <p className="text-xs text-muted-foreground">Guest</p>

              <p className="font-medium">{data.customerName}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Guests</p>

              <p className="font-medium">{data.guestCount}</p>
            </div>

            {data.table && (
              <div>
                <p className="text-xs text-muted-foreground">Assigned table</p>

                <p className="font-medium">{data.table.name}</p>

                {data.table.location && (
                  <p className="text-sm text-muted-foreground">
                    {data.table.location}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
