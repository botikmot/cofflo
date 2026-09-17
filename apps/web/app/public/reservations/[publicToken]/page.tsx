"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";

import { usePublicReservation } from "@/hooks/reservations/use-public-reservation";

const STATUS_STEPS = [
  {
    key: "PENDING",
    label: "Pending",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
  },
  {
    key: "SEATED",
    label: "Seated",
  },
  {
    key: "COMPLETED",
    label: "Completed",
  },
] as const;

export default function PublicReservationPage() {
  const params = useParams<{ publicToken: string }>();

  const publicToken = params.publicToken;

  const { data, isLoading, isError, isFetching, refetch } =
    usePublicReservation(publicToken);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F7F3ED]">
        <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="space-y-5">
            <div className="h-4 w-16 animate-pulse rounded bg-[#E7DDD3]" />

            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-[#E7DDD3]" />
              <div className="h-8 w-64 animate-pulse rounded bg-[#E1D6CB]" />
              <div className="h-4 w-40 animate-pulse rounded bg-[#E7DDD3]" />
            </div>

            <div className="h-32 animate-pulse rounded-3xl bg-white" />

            <div className="h-72 animate-pulse rounded-3xl bg-white" />
          </div>
        </section>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen bg-[#F7F3ED]">
        <section className="mx-auto max-w-lg px-4 py-10 sm:px-6 lg:py-16">
          <div className="rounded-3xl border border-[#E5D9CD] bg-[#FFFDF9] p-8 text-center shadow-[0_18px_50px_rgba(66,46,32,0.07)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1E8E0] text-[#6F4E37]">
              <CalendarDays className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[#2B2118]">
              Reservation not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#74665A]">
              This reservation link may be invalid or no longer available.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#2B2118] px-5 text-sm font-semibold text-white"
            >
              Go back
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const currentStepIndex = getStatusStepIndex(data.status);

  const startDate = new Date(data.startAt);
  const endDate = new Date(data.endAt);

  const dateLabel = startDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const startTimeLabel = startDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const endTimeLabel = endDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const isFinalStatus =
    data.status === "COMPLETED" ||
    data.status === "CANCELLED" ||
    data.status === "NO_SHOW";

  return (
    <main className="min-h-screen bg-[#F7F3ED]">
      <section className="mx-auto max-w-2xl px-4 py-7 sm:px-6 sm:py-10 lg:py-14">
        {/* Back */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6F4E37] transition hover:text-[#2B2118]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="mt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B7A6C]">
            {data.branch.organization.name}
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2B2118] sm:text-4xl">
            Your reservation
          </h1>

          <p className="mt-2 text-sm text-[#74665A]">{data.branch.name}</p>
        </div>

        {/* Status */}
        <div className="mt-7 overflow-hidden rounded-3xl border border-[#E5D9CD] bg-[#FFFDF9] shadow-[0_18px_50px_rgba(66,46,32,0.07)]">
          <div className="border-b border-[#E8DDD3] bg-[#F4EDE5] px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B7A6C]">
                  Reservation status
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                      getStatusBadgeClass(data.status),
                    ].join(" ")}
                  >
                    {formatReservationStatus(data.status)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#DCCFC3] bg-white px-3 text-xs font-semibold text-[#5F5146] transition hover:border-[#BCA997] disabled:opacity-60"
              >
                <RefreshCw
                  className={["h-4 w-4", isFetching ? "animate-spin" : ""].join(
                    " ",
                  )}
                />
                Refresh
              </button>
            </div>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#74665A]">
              {getReservationStatusMessage(data.status)}
            </p>
          </div>

          {/* Timeline */}
          {!isFinalStatus && (
            <div className="px-5 py-6 sm:px-6">
              <div className="space-y-5">
                {STATUS_STEPS.map((step, index) => {
                  const completed = index < currentStepIndex;
                  const current = index === currentStepIndex;

                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={[
                            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                            completed || current
                              ? "bg-[#6F4E37] text-white"
                              : "bg-[#EEE6DE] text-[#97887B]",
                          ].join(" ")}
                        >
                          {completed ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        {index < STATUS_STEPS.length - 1 && (
                          <div
                            className={[
                              "mt-1 h-8 w-px",
                              completed ? "bg-[#6F4E37]" : "bg-[#E6DCD2]",
                            ].join(" ")}
                          />
                        )}
                      </div>

                      <div className="pt-1">
                        <p
                          className={[
                            "text-sm font-semibold",
                            current || completed
                              ? "text-[#2B2118]"
                              : "text-[#95867A]",
                          ].join(" ")}
                        >
                          {step.label}
                        </p>

                        {current && (
                          <p className="mt-1 text-xs text-[#7D6D60]">
                            Current status
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {data.status === "CANCELLED" && (
            <div className="border-t border-red-100 bg-red-50 px-5 py-4 sm:px-6">
              <p className="text-sm font-medium text-red-700">
                This reservation has been cancelled.
              </p>
            </div>
          )}

          {data.status === "NO_SHOW" && (
            <div className="border-t border-amber-100 bg-amber-50 px-5 py-4 sm:px-6">
              <p className="text-sm font-medium text-amber-800">
                This reservation was marked as a no-show.
              </p>
            </div>
          )}
        </div>

        {/* Reservation details */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-[#E5D9CD] bg-[#FFFDF9] shadow-[0_18px_50px_rgba(66,46,32,0.05)]">
          <div className="border-b border-[#E8DDD3] px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold text-[#2B2118]">
              Reservation details
            </h2>
          </div>

          <div className="grid gap-px bg-[#E8DDD3] sm:grid-cols-2">
            <DetailItem
              icon={<CalendarDays className="h-4 w-4" />}
              label="Date"
              value={dateLabel}
            />

            <DetailItem
              icon={<Clock3 className="h-4 w-4" />}
              label="Time"
              value={`${startTimeLabel} — ${endTimeLabel}`}
            />

            <DetailItem
              icon={<Users className="h-4 w-4" />}
              label="Guests"
              value={`${data.guestCount} ${
                data.guestCount === 1 ? "guest" : "guests"
              }`}
            />

            <DetailItem
              icon={<Users className="h-4 w-4" />}
              label="Guest"
              value={data.customerName}
            />

            {data.table && (
              <DetailItem
                icon={<MapPin className="h-4 w-4" />}
                label="Table"
                value={`${data.table.name} · ${data.table.capacity} guests`}
                secondary={data.table.location ?? undefined}
              />
            )}

            {data.customerPhone && (
              <DetailItem
                icon={<Clock3 className="h-4 w-4" />}
                label="Phone"
                value={data.customerPhone}
              />
            )}
          </div>

          {data.notes && (
            <div className="border-t border-[#E8DDD3] px-5 py-5 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8B7A6C]">
                Notes
              </p>

              <p className="mt-2 text-sm leading-6 text-[#4F4339]">
                {data.notes}
              </p>
            </div>
          )}
        </div>

        {/* Reference */}
        <div className="mt-5 rounded-2xl border border-[#E5D9CD] bg-[#FAF7F3] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8B7A6C]">
            Reservation reference
          </p>

          <p className="mt-1 break-all font-mono text-xs text-[#5C4E43]">
            {publicToken}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center">
          <p className="text-xs leading-5 text-[#988A7E]">
            Refresh the page anytime to check for the latest reservation status.
          </p>

          {isFetching && (
            <p className="mt-2 text-xs font-medium text-[#6F4E37]">
              Updating reservation...
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function DetailItem({
  icon,
  label,
  value,
  secondary,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="bg-[#FFFDF9] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0E7DF] text-[#6F4E37]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#918174]">
            {label}
          </p>

          <p className="mt-1 text-sm font-medium leading-5 text-[#2B2118]">
            {value}
          </p>

          {secondary && (
            <p className="mt-1 text-xs text-[#7E7065]">{secondary}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusStepIndex(status: string) {
  switch (status) {
    case "PENDING":
      return 0;

    case "CONFIRMED":
      return 1;

    case "SEATED":
      return 2;

    case "COMPLETED":
      return 3;

    default:
      return 0;
  }
}

function formatReservationStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "CONFIRMED":
      return "Confirmed";

    case "SEATED":
      return "Seated";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    case "NO_SHOW":
      return "No-show";

    default:
      return status;
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-[#EFE8E1] text-[#6E5C4D]";

    case "CONFIRMED":
      return "bg-[#E5EFE7] text-[#3D684B]";

    case "SEATED":
      return "bg-[#E8E0F0] text-[#5F4C74]";

    case "COMPLETED":
      return "bg-[#DDEBE1] text-[#386347]";

    case "CANCELLED":
      return "bg-[#F8E3E0] text-[#97483F]";

    case "NO_SHOW":
      return "bg-[#F7ECD7] text-[#8A651D]";

    default:
      return "bg-[#EFE8E1] text-[#6E5C4D]";
  }
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
