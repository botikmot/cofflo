"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock3,
  MapPin,
  RefreshCw,
  Users,
  UserRound,
} from "lucide-react";

import { usePublicQueue } from "@/hooks/queue/use-public-queue";

const QUEUE_STEPS = [
  {
    key: "WAITING",
    label: "Waiting",
  },
  {
    key: "CALLED",
    label: "Called",
  },
  {
    key: "SEATED",
    label: "Seated",
  },
] as const;

export default function PublicQueuePage() {
  const params = useParams<{ publicToken: string }>();

  const publicToken = params.publicToken;

  const { data, isLoading, isError, isFetching, refetch } =
    usePublicQueue(publicToken);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F7F3ED]">
        <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="space-y-5">
            <div className="h-4 w-16 animate-pulse rounded bg-[#E7DDD3]" />

            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-[#E7DDD3]" />
              <div className="h-8 w-52 animate-pulse rounded bg-[#E1D6CB]" />
              <div className="h-4 w-36 animate-pulse rounded bg-[#E7DDD3]" />
            </div>

            <div className="h-52 animate-pulse rounded-3xl bg-white" />

            <div className="h-40 animate-pulse rounded-3xl bg-white" />
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
              <Clock3 className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[#2B2118]">
              Queue entry not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#74665A]">
              This queue link may be invalid or no longer available.
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

  const currentStepIndex = getQueueStepIndex(data.status);

  const isFinalStatus =
    data.status === "CANCELLED" ||
    data.status === "NO_SHOW" ||
    data.status === "SEATED";

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
            Your waitlist
          </h1>

          <p className="mt-2 text-sm text-[#74665A]">{data.branch.name}</p>
        </div>

        {/* Main queue card */}
        <div className="mt-7 overflow-hidden rounded-3xl border border-[#E5D9CD] bg-[#FFFDF9] shadow-[0_18px_50px_rgba(66,46,32,0.07)]">
          <div className="bg-[#F4EDE5] px-5 py-7 text-center sm:px-6 sm:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B7A6C]">
              Queue number
            </p>

            <p className="mt-2 text-6xl font-bold tracking-tight text-[#2B2118] sm:text-7xl">
              #{data.queueNumber}
            </p>

            <div className="mt-4 flex justify-center">
              <span
                className={[
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                  getQueueStatusClass(data.status),
                ].join(" ")}
              >
                {formatQueueStatus(data.status)}
              </span>
            </div>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#74665A]">
              {getQueueMessage(data.status)}
            </p>
          </div>

          {/* Position */}
          {data.status === "WAITING" && data.position !== null && (
            <div className="border-t border-[#E8DDD3] px-5 py-6 sm:px-6">
              <div className="rounded-2xl border border-[#E4D8CC] bg-[#FAF7F3] p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B7A6C]">
                  Your position
                </p>

                <p className="mt-1 text-5xl font-bold text-[#2B2118]">
                  {data.position}
                </p>

                <p className="mt-1 text-sm text-[#74665A]">
                  {data.position === 1
                    ? "You’re next in line."
                    : `${data.position - 1} ${
                        data.position - 1 === 1 ? "party" : "parties"
                      } ahead of you.`}
                </p>
              </div>
            </div>
          )}

          {/* Called state */}
          {data.status === "CALLED" && (
            <div className="border-t border-[#DCCFBE] bg-[#FBF2E0] px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6F4E37] text-white">
                  <Check className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#5D452D]">
                    Your table is ready
                  </p>

                  <p className="mt-1 text-sm leading-5 text-[#7C624A]">
                    Please proceed to the café and let the staff know your queue
                    number.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Seated state */}
          {data.status === "SEATED" && (
            <div className="border-t border-[#DDE8DE] bg-[#EDF6EE] px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#50745A] text-white">
                  <Check className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#3F6248]">
                    You are seated
                  </p>

                  <p className="mt-1 text-sm leading-5 text-[#5E7863]">
                    Enjoy your time at the café!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancelled */}
          {data.status === "CANCELLED" && (
            <div className="border-t border-red-100 bg-red-50 px-5 py-5 sm:px-6">
              <p className="text-sm font-medium text-red-700">
                This waitlist entry has been cancelled.
              </p>
            </div>
          )}

          {/* No show */}
          {data.status === "NO_SHOW" && (
            <div className="border-t border-amber-100 bg-amber-50 px-5 py-5 sm:px-6">
              <p className="text-sm font-medium text-amber-800">
                This waitlist entry was marked as a no-show.
              </p>
            </div>
          )}

          {/* Timeline */}
          {!isFinalStatus && (
            <div className="border-t border-[#E8DDD3] px-5 py-6 sm:px-6">
              <p className="text-sm font-semibold text-[#2B2118]">
                Queue progress
              </p>

              <div className="mt-5 space-y-5">
                {QUEUE_STEPS.map((step, index) => {
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

                        {index < QUEUE_STEPS.length - 1 && (
                          <div
                            className={[
                              "mt-1 h-7 w-px",
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
        </div>

        {/* Guest details */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-[#E5D9CD] bg-[#FFFDF9] shadow-[0_18px_50px_rgba(66,46,32,0.05)]">
          <div className="border-b border-[#E8DDD3] px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold text-[#2B2118]">
              Guest details
            </h2>
          </div>

          <div className="grid gap-px bg-[#E8DDD3] sm:grid-cols-2">
            <QueueDetail
              icon={<UserRound className="h-4 w-4" />}
              label="Guest"
              value={data.customerName}
            />

            <QueueDetail
              icon={<Users className="h-4 w-4" />}
              label="Guests"
              value={`${data.guestCount} ${
                data.guestCount === 1 ? "guest" : "guests"
              }`}
            />

            {data.table && (
              <QueueDetail
                icon={<MapPin className="h-4 w-4" />}
                label="Assigned table"
                value={data.table.name}
                secondary={
                  data.table.location
                    ? `${data.table.location} · ${data.table.capacity} guests`
                    : `${data.table.capacity} guests`
                }
              />
            )}
          </div>
        </div>

        {/* Reference */}
        <div className="mt-5 rounded-2xl border border-[#E5D9CD] bg-[#FAF7F3] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8B7A6C]">
            Queue reference
          </p>

          <p className="mt-1 break-all font-mono text-xs text-[#5C4E43]">
            {publicToken}
          </p>
        </div>

        {/* Refresh */}
        <div className="mt-5 flex flex-col items-center gap-2 text-center">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DCCFC3] bg-[#FFFDF9] px-5 text-sm font-semibold text-[#5F5146] shadow-sm transition hover:border-[#BCA997] disabled:opacity-60"
          >
            <RefreshCw
              className={["h-4 w-4", isFetching ? "animate-spin" : ""].join(
                " ",
              )}
            />
            {isFetching ? "Updating..." : "Refresh queue"}
          </button>

          <p className="text-xs leading-5 text-[#988A7E]">
            Refresh anytime to check for the latest queue position and status.
          </p>
        </div>
      </section>
    </main>
  );
}

function QueueDetail({
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

function getQueueStepIndex(status: string) {
  switch (status) {
    case "WAITING":
      return 0;

    case "CALLED":
      return 1;

    case "SEATED":
      return 2;

    default:
      return 0;
  }
}

function formatQueueStatus(status: string) {
  switch (status) {
    case "WAITING":
      return "Waiting";

    case "CALLED":
      return "Called";

    case "SEATED":
      return "Seated";

    case "CANCELLED":
      return "Cancelled";

    case "NO_SHOW":
      return "No-show";

    default:
      return status;
  }
}

function getQueueStatusClass(status: string) {
  switch (status) {
    case "WAITING":
      return "bg-[#EFE8E1] text-[#6E5C4D]";

    case "CALLED":
      return "bg-[#F7ECD7] text-[#805D1D]";

    case "SEATED":
      return "bg-[#DDEBE1] text-[#386347]";

    case "CANCELLED":
      return "bg-[#F8E3E0] text-[#97483F]";

    case "NO_SHOW":
      return "bg-[#F7ECD7] text-[#8A651D]";

    default:
      return "bg-[#EFE8E1] text-[#6E5C4D]";
  }
}

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
