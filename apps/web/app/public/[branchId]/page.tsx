"use client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Coffee,
  MapPin,
  Users,
  Utensils,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { QueueConfirmation } from "@/components/public/queue/queue-confirmation";
import { QueueForm } from "@/components/public/queue/queue-form";
import { ReservationConfirmation } from "@/components/public/reservation/reservation-confirmation";
import { ReservationForm } from "@/components/public/reservation/reservation-form";

import { usePublicBranch } from "@/hooks/public/use-public-branch";

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
      <main className="min-h-screen bg-[#F7F3ED] px-5 py-6 text-[#2B2118]">
        <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
          <div className="w-full rounded-[32px] border border-[#E8DED4] bg-[#FFFDF9] p-8 text-center shadow-[0_20px_60px_rgba(70,45,25,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0E5D9] text-[#6F4E37]">
              <Coffee className="h-7 w-7 animate-pulse" />
            </div>

            <h1 className="mt-5 text-xl font-semibold">
              Preparing your café experience
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#8B7E74]">
              Just a moment...
            </p>

            <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-[#EDE3DA]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[#6F4E37]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen bg-[#F7F3ED] px-5 py-8 text-[#2B2118]">
        <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
          <div className="w-full rounded-[32px] border border-[#E8DED4] bg-[#FFFDF9] p-8 text-center shadow-[0_20px_60px_rgba(70,45,25,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Coffee className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-xl font-semibold">Café unavailable</h1>

            <p className="mt-2 text-sm leading-6 text-[#8B7E74]">
              This café branch is currently unavailable. Please try again later.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (view === "confirmation" && reservationToken) {
    return (
      <main className="min-h-screen bg-[#F7F3ED] px-4 py-6 text-[#2B2118]">
        <section className="mx-auto max-w-md py-4 sm:py-8">
          <ReservationConfirmation publicToken={reservationToken} />
        </section>
      </main>
    );
  }

  if (view === "reservation") {
    return (
      <main className="min-h-screen bg-[#F7F3ED] px-4 py-6 text-[#2B2118] sm:px-6">
        <section className="mx-auto max-w-lg py-4 sm:py-8">
          <button
            type="button"
            onClick={() => setView("home")}
            className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#7E7065] transition hover:text-[#2B2118]"
          >
            <span className="transition group-hover:-translate-x-0.5">←</span>
            Back
          </button>

          <div className="mb-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E3D5C8] bg-[#FFF9F4] px-3 py-1.5 text-xs font-medium text-[#6F4E37]">
              <CalendarDays className="h-3.5 w-3.5" />
              Table reservation
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Reserve your table
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#8B7E74]">
              Plan your visit to{" "}
              <span className="font-medium text-[#5F4A3B]">
                {data.organization.name}
              </span>{" "}
              · {data.branch.name}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#E8DED4] bg-[#FFFDF9] p-5 shadow-[0_16px_50px_rgba(70,45,25,0.06)] sm:p-7">
            <ReservationForm
              branchId={branchId}
              onComplete={(publicToken) => {
                setReservationToken(publicToken);
                setView("confirmation");
              }}
            />
          </div>
        </section>
      </main>
    );
  }

  if (view === "queue-confirmation" && queueToken && queueNumber !== null) {
    return (
      <main className="min-h-screen bg-[#F7F3ED] px-4 py-6 text-[#2B2118]">
        <section className="mx-auto max-w-md py-4 sm:py-8">
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
      <main className="min-h-screen bg-[#F7F3ED] px-4 py-6 text-[#2B2118] sm:px-6">
        <section className="mx-auto max-w-lg py-4 sm:py-8">
          <button
            type="button"
            onClick={() => setView("home")}
            className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#7E7065] transition hover:text-[#2B2118]"
          >
            <span className="transition group-hover:-translate-x-0.5">←</span>
            Back
          </button>

          <div className="mb-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E3D5C8] bg-[#FFF9F4] px-3 py-1.5 text-xs font-medium text-[#6F4E37]">
              <Users className="h-3.5 w-3.5" />
              Dine-in waitlist
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Join the waitlist
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#8B7E74]">
              Get in line for a table at{" "}
              <span className="font-medium text-[#5F4A3B]">
                {data.branch.name}
              </span>
              .
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            <InfoPill icon={<Users className="h-4 w-4" />} label="Dine-in" />

            <InfoPill icon={<Clock3 className="h-4 w-4" />} label="Today" />
          </div>

          <div className="rounded-[28px] border border-[#E8DED4] bg-[#FFFDF9] p-5 shadow-[0_16px_50px_rgba(70,45,25,0.06)] sm:p-7">
            <QueueForm
              branchId={branchId}
              onComplete={(result) => {
                setQueueToken(result.publicToken);
                setQueueNumber(result.queueNumber);
                setView("queue-confirmation");
              }}
            />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F3ED] text-[#2B2118]">
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#DDBF9F]/20 blur-3xl" />
          <div className="absolute -left-24 top-72 h-64 w-64 rounded-full bg-[#B98B6A]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pb-20">
          {/* TOP BAR */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#6F4E37]
                  text-white
                  shadow-[0_10px_30px_rgba(111,78,55,0.2)]
                "
              >
                <Coffee className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#2B2118]">
                  {data.organization.name}
                </p>

                <div className="mt-0.5 flex items-center gap-1 text-xs text-[#948477]">
                  <MapPin className="h-3 w-3" />
                  {data.branch.name}
                </div>
              </div>
            </div>

            <div className="hidden rounded-full border border-[#E5D8CD] bg-[#FFF9F5] px-3 py-1.5 text-xs font-medium text-[#7B6B5E] sm:block">
              {data.organization.currency}
            </div>
          </header>

          {/* HERO COPY */}
          <div className="mx-auto mt-14 max-w-3xl text-center sm:mt-16 lg:mt-20">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#E2D2C3] bg-[#FFF9F4] px-4 py-2 text-xs font-medium text-[#6F4E37] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8F6748]" />
              Your table, your time, your way.
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#2B2118] sm:text-5xl lg:text-6xl">
              A better way to enjoy
              <span className="block text-[#6F4E37]">your café visit.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#817369] sm:text-base">
              Reserve ahead, join the waitlist, or order your favorites.
              Everything you need for your next visit is just a tap away.
            </p>
          </div>

          {/* PRIMARY ACTIONS */}
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ActionCard
              icon={<CalendarDays className="h-6 w-6" />}
              eyebrow="Plan ahead"
              title="Reserve a Table"
              description="Choose your time and book your table in advance."
              onClick={() => setView("reservation")}
              primary
            />

            <ActionCard
              icon={<Users className="h-6 w-6" />}
              eyebrow="Coming today"
              title="Join Waitlist"
              description="Get in line for a table without waiting at the café."
              onClick={() => setView("queue")}
            />

            <div className="group relative overflow-hidden rounded-[28px] border border-[#E8DED4] bg-[#2B2118] p-6 text-white shadow-[0_16px_50px_rgba(43,33,24,0.12)] sm:col-span-2 lg:col-span-1">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

              <div className="relative flex h-full flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#E8C9AA]">
                  <Utensils className="h-6 w-6" />
                </div>

                <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-[#CBB5A2]">
                  Hungry now?
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Order from the Menu
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#C6B5A7]">
                  Browse the menu and start your order whenever you&apos;re
                  ready.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `/public/${branchId}/order`;
                  }}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:gap-3"
                >
                  View menu
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* TRUST STRIP */}
          <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-3">
            <TrustItem
              title="Easy to book"
              description="Reserve in just a few steps."
            />

            <TrustItem
              title="Less waiting"
              description="Join the queue before you arrive."
            />

            <TrustItem
              title="Simple ordering"
              description="Browse and order from your phone."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E8DED4] bg-[#FBF7F2]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-center text-xs text-[#9A8C80] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
          <p>
            {data.organization.name} · {data.branch.name}
          </p>

          <p>
            {data.organization.tagline
              ? data.organization.tagline
              : "Welcome. Relax. Enjoy your coffee."}
          </p>
        </div>
      </footer>
    </main>
  );
}

function ActionCard({
  icon,
  eyebrow,
  title,
  description,
  onClick,
  primary = false,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        rounded-[28px]
        border
        p-6
        text-left
        transition-all
        duration-200
        hover:-translate-y-0.5
        ${
          primary
            ? "border-[#6F4E37] bg-[#6F4E37] text-white shadow-[0_16px_45px_rgba(111,78,55,0.18)] hover:bg-[#5F402D]"
            : "border-[#E8DED4] bg-[#FFFDF9] text-[#2B2118] shadow-[0_12px_40px_rgba(70,45,25,0.05)] hover:border-[#D8C7B8] hover:shadow-[0_16px_50px_rgba(70,45,25,0.08)]"
        }
      `}
    >
      <div
        className={`
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          ${
            primary
              ? "bg-white/10 text-[#F0D8C1]"
              : "bg-[#F3EBE3] text-[#6F4E37]"
          }
        `}
      >
        {icon}
      </div>

      <p
        className={`
          mt-5
          text-xs
          font-medium
          uppercase
          tracking-[0.14em]
          ${primary ? "text-[#E2CBB6]" : "text-[#9A8C80]"}
        `}
      >
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-semibold">{title}</h2>

      <p
        className={`
          mt-2
          text-sm
          leading-6
          ${primary ? "text-[#E2D4C8]" : "text-[#817369]"}
        `}
      >
        {description}
      </p>

      <div
        className={`
          mt-6
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          transition-all
          group-hover:gap-3
          ${primary ? "text-white" : "text-[#6F4E37]"}
        `}
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </div>
    </button>
  );
}

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-[#E5D8CD] bg-[#FFF9F4] px-4 py-3 text-sm font-medium text-[#6F6258]">
      <span className="text-[#6F4E37]">{icon}</span>
      {label}
    </div>
  );
}

function TrustItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E7DBD0] bg-[#FFFDF9]/70 px-4 py-4 text-center shadow-sm">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#F1E8DF] text-[#6F4E37]">
        <Check className="h-4 w-4" />
      </div>

      <p className="mt-3 text-sm font-semibold text-[#4D3D31]">{title}</p>

      <p className="mt-1 text-xs leading-5 text-[#938479]">{description}</p>
    </div>
  );
}
