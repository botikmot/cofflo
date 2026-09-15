"use client";

import { useParams } from "next/navigation";

import { usePublicReservation } from "@/hooks/reservations/use-public-reservation";

export default function PublicReservationPage() {
  const params = useParams<{ publicToken: string }>();

  const publicToken = params.publicToken;

  const { data, isLoading, isError, refetch } =
    usePublicReservation(publicToken);

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <p className="text-sm text-muted-foreground">
            Loading reservation...
          </p>
        </section>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <div className="rounded-2xl border p-6 text-center">
            <h1 className="text-xl font-bold">Reservation not found</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              This reservation link may be invalid or no longer available.
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

            <h1 className="text-2xl font-bold">Reservation</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {data.branch.name}
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-sm text-muted-foreground">Status</p>

            <p className="mt-1 text-xl font-bold">{data.status}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {getReservationStatusMessage(data.status)}
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

            <div>
              <p className="text-xs text-muted-foreground">Date</p>

              <p className="font-medium">
                {new Date(data.startAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Time</p>

              <p className="font-medium">
                {new Date(data.startAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
                {" — "}
                {new Date(data.endAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {data.table && (
              <div>
                <p className="text-xs text-muted-foreground">Table</p>

                <p className="font-medium">
                  {data.table.name}
                  {" · "}
                  {data.table.capacity} guests
                </p>

                {data.table.location && (
                  <p className="text-sm text-muted-foreground">
                    {data.table.location}
                  </p>
                )}
              </div>
            )}

            {data.notes && (
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>

                <p className="text-sm">{data.notes}</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="w-full rounded-xl border px-4 py-3 font-medium"
          >
            Refresh status
          </button>
        </div>
      </section>
    </main>
  );
}

function getReservationStatusMessage(status: string) {
  switch (status) {
    case "PENDING":
      return "Your reservation has been received and is waiting for confirmation.";

    case "CONFIRMED":
      return "Your reservation is confirmed. See you soon!";

    case "SEATED":
      return "You are marked as seated. Enjoy your stay!";

    case "COMPLETED":
      return "Thanks for visiting! We hope to see you again soon.";

    case "CANCELLED":
      return "This reservation has been cancelled.";

    case "NO_SHOW":
      return "This reservation was marked as a no-show.";

    default:
      return "Your reservation status has been updated.";
  }
}
