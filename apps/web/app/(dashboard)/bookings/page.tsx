"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CalendarDays,
  ChevronDown,
  Clock3,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useWorkspace } from "@/hooks/auth/use-workspace";

import { useReservations } from "@/hooks/reservations/use-reservations";
import { useUpdateReservationStatus } from "@/hooks/reservations/use-update-reservation-status";
import { useCreateDashboardReservation } from "@/hooks/reservations/use-create-dashboard-reservation";

import { NewBookingModal } from "@/components/bookings/new-booking-modal";

import { tableSessionService } from "@/services/table-session.service";

import type {
  Reservation,
  ReservationStatus,
  CreateReservationPayload,
} from "@/types/reservation";

type Filter = "ALL" | "TODAY" | "UPCOMING" | "COMPLETED";

const STATUS_OPTIONS: ReservationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SEATED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatTimeRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Invalid time";
  }

  const formatter = new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function formatStatus(status: ReservationStatus) {
  return status.replace("_", " ");
}

function getStatusClasses(status: ReservationStatus) {
  switch (status) {
    case "PENDING":
      return "bg-[#FFF4D9] text-[#8A6418]";

    case "CONFIRMED":
      return "bg-[#E8F3E9] text-[#3D6D42]";

    case "SEATED":
      return "bg-[#E7F0FA] text-[#46698D]";

    case "COMPLETED":
      return "bg-[#EEEAE5] text-[#6F6258]";

    case "CANCELLED":
      return "bg-[#FBEAEA] text-[#8A4A4A]";

    case "NO_SHOW":
      return "bg-[#F5E7E1] text-[#88583F]";

    default:
      return "bg-[#F1ECE7] text-[#6F6258]";
  }
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function matchesFilter(reservation: Reservation, filter: Filter) {
  const now = new Date();
  const start = new Date(reservation.startAt);

  if (Number.isNaN(start.getTime())) {
    return false;
  }

  if (filter === "ALL") {
    return true;
  }

  if (filter === "TODAY") {
    return isSameDay(start, now);
  }

  if (filter === "UPCOMING") {
    return (
      start >= now &&
      reservation.status !== "CANCELLED" &&
      reservation.status !== "NO_SHOW" &&
      reservation.status !== "COMPLETED"
    );
  }

  if (filter === "COMPLETED") {
    return reservation.status === "COMPLETED";
  }

  return true;
}

function getReservationPriority(status: ReservationStatus) {
  switch (status) {
    case "PENDING":
    case "CONFIRMED":
    case "SEATED":
      return 0;

    case "COMPLETED":
    case "CANCELLED":
    case "NO_SHOW":
      return 1;

    default:
      return 1;
  }
}

function hasReservationActions(status: ReservationStatus) {
  return (
    status === "PENDING" ||
    status === "CONFIRMED" ||
    status === "SEATED" ||
    status === "CANCELLED" ||
    status === "NO_SHOW"
  );
}

/* -------------------------------------------------------------------------- */
/* ACTION MENU                                                                 */
/* -------------------------------------------------------------------------- */

type ReservationActionMenuProps = {
  reservation: Reservation;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onStatusChange: (
    reservationId: string,
    status: ReservationStatus,
  ) => void | Promise<void>;
  onOpenSession: (reservation: Reservation) => void | Promise<void>;
  disabled?: boolean;
};

function ReservationActionMenu({
  reservation,
  open,
  onOpen,
  onClose,
  onStatusChange,
  onOpenSession,
  disabled = false,
}: ReservationActionMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();

    const menuWidth = 176;

    let menuHeight = 48;

    if (reservation.status === "PENDING") {
      menuHeight = 88;
    } else if (reservation.status === "CONFIRMED") {
      menuHeight = 136;
    } else if (reservation.status === "SEATED") {
      menuHeight = 88;
    } else if (
      reservation.status === "CANCELLED" ||
      reservation.status === "NO_SHOW"
    ) {
      menuHeight = 48;
    }

    const spacing = 8;

    const spaceBelow = window.innerHeight - rect.bottom;

    const openAbove = spaceBelow < menuHeight + 16;

    const top = openAbove
      ? rect.top - menuHeight - spacing
      : rect.bottom + spacing;

    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8,
    );

    setPosition({
      top: Math.max(8, top),
      left,
    });
  }, [reservation.status]);

  const handleOpen = () => {
    updatePosition();
    onOpen();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (buttonRef.current?.contains(target)) {
        return;
      }

      const menu = document.getElementById(
        `reservation-action-menu-${reservation.id}`,
      );

      if (menu?.contains(target)) {
        return;
      }

      onClose();
    };

    const handleScroll = () => {
      onClose();
    };

    const handleResize = () => {
      onClose();
    };

    document.addEventListener("mousedown", handleOutsideClick);

    window.addEventListener("scroll", handleScroll, true);

    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      window.removeEventListener("scroll", handleScroll, true);

      window.removeEventListener("resize", handleResize);
    };
  }, [open, onClose, reservation.id]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8E8176] transition hover:bg-[#F4ECE4] hover:text-[#6F4E37] disabled:opacity-50"
        aria-label={`Actions for ${reservation.customerName}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            id={`reservation-action-menu-${reservation.id}`}
            className="fixed z-[100] w-44 rounded-xl border border-[#E7DCCE] bg-[#FFFDF9] p-1.5 text-left shadow-xl"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {/* PENDING */}
            {reservation.status === "PENDING" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    void onStatusChange(reservation.id, "CONFIRMED");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#4B3E35] hover:bg-[#F7F1EB]"
                >
                  Confirm
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    void onStatusChange(reservation.id, "CANCELLED");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#8A4A4A] hover:bg-[#FBEAEA]"
                >
                  Cancel
                </button>
              </>
            )}

            {/* CONFIRMED */}
            {reservation.status === "CONFIRMED" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    void onStatusChange(reservation.id, "SEATED");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#4B3E35] hover:bg-[#F7F1EB]"
                >
                  Seat customer
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    void onStatusChange(reservation.id, "NO_SHOW");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#4B3E35] hover:bg-[#F7F1EB]"
                >
                  Mark no-show
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    void onStatusChange(reservation.id, "CANCELLED");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#8A4A4A] hover:bg-[#FBEAEA]"
                >
                  Cancel
                </button>
              </>
            )}

            {/* SEATED */}
            {reservation.status === "SEATED" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    void onOpenSession(reservation);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#4B3E35] hover:bg-[#F7F1EB]"
                >
                  Open session
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    void onStatusChange(reservation.id, "COMPLETED");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#4B3E35] hover:bg-[#F7F1EB]"
                >
                  Complete reservation
                </button>
              </>
            )}

            {/* CANCELLED */}
            {reservation.status === "CANCELLED" && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  void onStatusChange(reservation.id, "PENDING");
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#4B3E35] hover:bg-[#F7F1EB]"
              >
                Reopen booking
              </button>
            )}

            {/* NO SHOW */}
            {reservation.status === "NO_SHOW" && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  void onStatusChange(reservation.id, "PENDING");
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#4B3E35] hover:bg-[#F7F1EB]"
              >
                Reopen booking
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* BOOKINGS PAGE                                                              */
/* -------------------------------------------------------------------------- */

export default function BookingsPage() {
  const router = useRouter();

  const { user, activeMembership } = useWorkspace();

  const organizationId = activeMembership?.organizationId;

  const branchId = activeMembership?.branchId;

  const [filter, setFilter] = useState<Filter>("TODAY");

  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "ALL">(
    "ALL",
  );

  const [search, setSearch] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  const canManageReservations = Boolean(user && organizationId && branchId);

  const reservationsQuery = useReservations(organizationId, branchId);

  const updateStatus = useUpdateReservationStatus(organizationId, branchId);

  const createReservation = useCreateDashboardReservation(
    organizationId,
    branchId,
  );

  /* ---------------------------------------------------------------------- */
  /* FILTERED RESERVATIONS                                                   */
  /* ---------------------------------------------------------------------- */

  const filteredReservations = useMemo(() => {
    const reservations = reservationsQuery.data ?? [];

    const normalizedSearch = search.trim().toLowerCase();

    return reservations
      .filter((reservation) => matchesFilter(reservation, filter))
      .filter((reservation) => {
        if (statusFilter === "ALL") {
          return true;
        }

        return reservation.status === statusFilter;
      })
      .filter((reservation) => {
        if (!normalizedSearch) {
          return true;
        }

        const customerName = reservation.customerName.toLowerCase();

        const customerPhone = reservation.customerPhone?.toLowerCase() ?? "";

        const tableName = reservation.table?.name.toLowerCase() ?? "";

        return (
          customerName.includes(normalizedSearch) ||
          customerPhone.includes(normalizedSearch) ||
          tableName.includes(normalizedSearch)
        );
      })
      .sort((a, b) => {
        const priorityDifference =
          getReservationPriority(a.status) - getReservationPriority(b.status);

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
      });
  }, [reservationsQuery.data, filter, statusFilter, search]);

  /* ---------------------------------------------------------------------- */
  /* STATUS CHANGE                                                           */
  /* ---------------------------------------------------------------------- */

  const handleStatusChange = async (
    reservationId: string,
    status: ReservationStatus,
  ) => {
    const reservation = reservationsQuery.data?.find(
      (item) => item.id === reservationId,
    );

    if (!reservation) {
      return;
    }

    if (status === "CANCELLED") {
      const confirmed = window.confirm(
        `Cancel the booking for ${reservation.customerName}?`,
      );

      if (!confirmed) {
        return;
      }
    }

    if (
      status === "PENDING" &&
      (reservation.status === "CANCELLED" || reservation.status === "NO_SHOW")
    ) {
      const confirmed = window.confirm(
        `Reopen the booking for ${reservation.customerName}?`,
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      await updateStatus.mutateAsync({
        reservationId,
        status,
      });

      setOpenMenuId(null);
    } catch (error) {
      console.error("Failed to update reservation status:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to update reservation status.",
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* CREATE BOOKING                                                          */
  /* ---------------------------------------------------------------------- */

  const handleCreateBooking = async (payload: CreateReservationPayload) => {
    await createReservation.mutateAsync(payload);

    setIsNewBookingOpen(false);
  };

  /* ---------------------------------------------------------------------- */
  /* OPEN TABLE SESSION                                                      */
  /* ---------------------------------------------------------------------- */

  const handleOpenReservationSession = async (reservation: Reservation) => {
    if (!organizationId || !branchId) {
      window.alert("No active workspace is selected.");
      return;
    }

    if (!reservation.tableId) {
      window.alert("This reservation has no assigned table.");
      return;
    }

    try {
      const session = await tableSessionService.getActiveSession(
        organizationId,
        branchId,
        reservation.tableId,
      );

      if (!session) {
        window.alert("No active table session was found for this reservation.");
        return;
      }

      router.push(`/tables/session/${session.id}`);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to open the table session.",
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9A8C80]">
            Bookings
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-[#2B2118]">
            Reservations
          </h1>

          <p className="mt-1 text-sm text-[#8B7E74]">
            {activeMembership?.branch?.name
              ? `Manage reservations for ${activeMembership.branch.name}.`
              : "Manage customer reservations for this branch."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => reservationsQuery.refetch()}
            disabled={reservationsQuery.isFetching || !canManageReservations}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3 text-sm font-medium text-[#6F4E37] transition hover:bg-[#F7F1EB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                reservationsQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            disabled={!canManageReservations}
            onClick={() => setIsNewBookingOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white transition hover:bg-[#5E402E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            New booking
          </button>
        </div>
      </div>

      {/* NO ACTIVE WORKSPACE */}
      {!canManageReservations && (
        <div className="rounded-2xl border border-[#E7DCCE] bg-[#FFFDF9] px-5 py-4 text-sm text-[#8B7E74] shadow-sm">
          Select an active branch before managing reservations.
        </div>
      )}

      {/* FILTERS */}
      <div className="rounded-2xl border border-[#E7DCCE] bg-[#FFFDF9] p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* PERIOD FILTERS */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["ALL", "All"],
                ["TODAY", "Today"],
                ["UPCOMING", "Upcoming"],
                ["COMPLETED", "Completed"],
              ] as [Filter, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  filter === value
                    ? "bg-[#6F4E37] text-white"
                    : "bg-[#F7F1EB] text-[#6F4E37] hover:bg-[#EEE5DB]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* SEARCH / STATUS */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8C80]" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, phone, or table..."
                className="h-10 w-full rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] pl-9 pr-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#A99B8E] focus:border-[#B99A80] focus:ring-2 focus:ring-[#B99A80]/10"
              />
            </div>

            <div className="relative sm:w-48">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as ReservationStatus | "ALL",
                  )
                }
                className="h-10 w-full appearance-none rounded-xl border border-[#E0D4C8] bg-[#FAF6F1] px-3 pr-9 text-sm text-[#2B2118] outline-none transition focus:border-[#B99A80] focus:ring-2 focus:ring-[#B99A80]/10"
              >
                <option value="ALL">All statuses</option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B7E74]" />
            </div>
          </div>
        </div>
      </div>

      {/* RESERVATIONS */}
      <div className="rounded-2xl border border-[#E7DCCE] bg-[#FFFDF9] shadow-sm">
        {!canManageReservations ? (
          <div className="flex min-h-64 items-center justify-center px-6 text-center">
            <p className="text-sm text-[#8B7E74]">No active branch selected.</p>
          </div>
        ) : reservationsQuery.isLoading ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-[#8B7E74]">
            Loading reservations...
          </div>
        ) : reservationsQuery.isError ? (
          <div className="flex min-h-64 items-center justify-center px-6 text-center">
            <div>
              <p className="text-sm font-medium text-[#7A4A3D]">
                Failed to load reservations.
              </p>

              <button
                type="button"
                onClick={() => reservationsQuery.refetch()}
                className="mt-3 rounded-xl border border-[#DCCFC1] px-3 py-2 text-xs font-medium text-[#6F4E37] hover:bg-[#F7F1EB]"
              >
                Try again
              </button>
            </div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 rounded-2xl bg-[#F7F1EB] p-4">
              <CalendarDays className="h-6 w-6 text-[#6F4E37]" />
            </div>

            <h3 className="text-sm font-semibold text-[#2B2118]">
              No reservations found
            </h3>

            <p className="mt-1 text-xs text-[#8B7E74]">
              Try another filter or create a new booking.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EEE6DD] text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#918378]">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#918378]">
                      Date & Time
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#918378]">
                      Guests
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#918378]">
                      Table
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#918378]">
                      Status
                    </th>

                    <th className="w-12 px-5 py-4" />
                  </tr>
                </thead>

                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-b border-[#F0E8DF] last:border-b-0"
                    >
                      {/* CUSTOMER */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#2B2118]">
                          {reservation.customerName}
                        </p>

                        {reservation.customerPhone && (
                          <p className="mt-1 text-xs text-[#8B7E74]">
                            {reservation.customerPhone}
                          </p>
                        )}
                      </td>

                      {/* DATE / TIME */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#4B3E35]">
                          {formatDateTime(reservation.startAt)}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-xs text-[#8B7E74]">
                          <Clock3 className="h-3.5 w-3.5" />

                          {formatTimeRange(
                            reservation.startAt,
                            reservation.endAt,
                          )}
                        </p>
                      </td>

                      {/* GUESTS */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-[#4B3E35]">
                          <Users className="h-4 w-4 text-[#8B7E74]" />

                          {reservation.guestCount}
                        </div>
                      </td>

                      {/* TABLE */}
                      <td className="px-5 py-4">
                        {reservation.table ? (
                          <div>
                            <p className="text-sm font-medium text-[#4B3E35]">
                              {reservation.table.name}
                            </p>

                            {reservation.table.location && (
                              <p className="mt-1 text-xs text-[#8B7E74]">
                                {reservation.table.location}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-[#9A8C80]">
                            Auto assigned
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            reservation.status,
                          )}`}
                        >
                          {formatStatus(reservation.status)}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 text-right">
                        {hasReservationActions(reservation.status) && (
                          <ReservationActionMenu
                            reservation={reservation}
                            open={openMenuId === reservation.id}
                            onOpen={() => setOpenMenuId(reservation.id)}
                            onClose={() => setOpenMenuId(null)}
                            onStatusChange={handleStatusChange}
                            onOpenSession={handleOpenReservationSession}
                            disabled={updateStatus.isPending}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="divide-y divide-[#F0E8DF] md:hidden">
              {filteredReservations.map((reservation) => (
                <div key={reservation.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#2B2118]">
                        {reservation.customerName}
                      </p>

                      <p className="mt-1 text-xs text-[#8B7E74]">
                        {formatDateTime(reservation.startAt)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                        reservation.status,
                      )}`}
                    >
                      {formatStatus(reservation.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[#6F6258]">
                    <div>
                      <p className="text-[#A09388]">Time</p>

                      <p className="mt-1 font-medium">
                        {formatTimeRange(
                          reservation.startAt,
                          reservation.endAt,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#A09388]">Guests</p>

                      <p className="mt-1 font-medium">
                        {reservation.guestCount}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#A09388]">Table</p>

                      <p className="mt-1 font-medium">
                        {reservation.table?.name ?? "Auto assigned"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#A09388]">Phone</p>

                      <p className="mt-1 font-medium">
                        {reservation.customerPhone ?? "—"}
                      </p>
                    </div>
                  </div>

                  {hasReservationActions(reservation.status) && (
                    <div className="mt-4 flex justify-end">
                      <ReservationActionMenu
                        reservation={reservation}
                        open={openMenuId === reservation.id}
                        onOpen={() => setOpenMenuId(reservation.id)}
                        onClose={() => setOpenMenuId(null)}
                        onStatusChange={handleStatusChange}
                        onOpenSession={handleOpenReservationSession}
                        disabled={updateStatus.isPending}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* NEW BOOKING MODAL */}
      <NewBookingModal
        open={isNewBookingOpen}
        organizationId={organizationId ?? ""}
        branchId={branchId ?? ""}
        tables={[]}
        isSubmitting={createReservation.isPending}
        onClose={() => setIsNewBookingOpen(false)}
        onSubmit={handleCreateBooking}
      />
    </div>
  );
}
