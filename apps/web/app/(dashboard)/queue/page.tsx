"use client";

import { Check, Clock3, MoreHorizontal, RefreshCw, Users } from "lucide-react";
import { createPortal } from "react-dom";
import { useMemo, useState, type MouseEvent } from "react";

import { useWorkspace } from "@/hooks/auth/use-workspace";

import { useQueue } from "@/hooks/queue/use-queue";
import { useQueueSummary } from "@/hooks/queue/use-queue-summary";
import { useCallNext } from "@/hooks/queue/use-call-next";
import { useMarkQueueSeated } from "@/hooks/queue/use-mark-queue-seated";
import { useCancelQueue } from "@/hooks/queue/use-cancel-queue";

import { useTables } from "@/hooks/tables/use-tables";

import type { QueueEntry, QueueStatus } from "@/types/queue";
import type { DashboardTable } from "@/types/dashboard";
import { useRouter } from "next/navigation";

import { tableSessionService } from "@/services/table-session.service";

type Filter = "ALL" | "WAITING" | "CALLED" | "SEATED";

type MenuPosition = {
  top: number;
  left: number;
};

function formatWaitingMinutes(joinedAt: string) {
  const joined = new Date(joinedAt);

  if (Number.isNaN(joined.getTime())) {
    return "-";
  }

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - joined.getTime()) / 60000),
  );

  if (minutes === 0) {
    return "<1 min";
  }

  return `${minutes} min`;
}

function getStatusClasses(status: QueueStatus) {
  switch (status) {
    case "WAITING":
      return "bg-[#FFF4D9] text-[#8A6418]";

    case "CALLED":
      return "bg-[#E7F0FA] text-[#46698D]";

    case "SEATED":
      return "bg-[#E8F3E9] text-[#3D6D42]";

    case "CANCELLED":
      return "bg-[#FBEAEA] text-[#8A4A4A]";

    case "NO_SHOW":
      return "bg-[#F5E7E1] text-[#88583F]";

    default:
      return "bg-[#F1ECE7] text-[#6F6258]";
  }
}

function formatStatus(status: QueueStatus) {
  return status.replace("_", " ");
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9A8C80]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#2B2118]">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F0E9] text-[#6F4E37]">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function QueuePage() {
  const { activeMembership, isLoading: workspaceLoading } = useWorkspace();

  const organizationId = activeMembership?.organizationId;
  const branchId = activeMembership?.branchId;

  const [filter, setFilter] = useState<Filter>("ALL");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const router = useRouter();

  const {
    data: queue = [],
    isLoading: queueLoading,
    isError: queueError,
    isFetching: queueFetching,
    refetch: refetchQueue,
  } = useQueue(organizationId, branchId);

  const {
    data: summary,
    isLoading: summaryLoading,
    isFetching: summaryFetching,
    refetch: refetchSummary,
  } = useQueueSummary(organizationId, branchId);

  const {
    data: tables = [],
    isLoading: tablesLoading,
    isFetching: tablesFetching,
    refetch: refetchTables,
  } = useTables({
    organizationId,
    branchId,
  });

  const callNext = useCallNext(organizationId, branchId);

  const markSeated = useMarkQueueSeated(organizationId, branchId);

  const cancelQueue = useCancelQueue(organizationId, branchId);

  const activeQueue = useMemo(() => {
    return queue.filter((entry) => {
      if (entry.status === "WAITING" || entry.status === "CALLED") {
        return true;
      }

      if (entry.status === "SEATED") {
        return entry.table?.status === "OCCUPIED";
      }

      return false;
    });
  }, [queue]);

  const filteredQueue = useMemo(() => {
    const filtered =
      filter === "ALL"
        ? activeQueue
        : activeQueue.filter((entry) => entry.status === filter);

    const priority: Record<QueueStatus, number> = {
      WAITING: 0,
      CALLED: 1,
      SEATED: 2,
      CANCELLED: 3,
      NO_SHOW: 4,
    };

    return [...filtered].sort((a, b) => {
      const statusDifference = priority[a.status] - priority[b.status];

      if (statusDifference !== 0) {
        return statusDifference;
      }

      // Preserve queue order within the same status.
      return a.queueNumber - b.queueNumber;
    });
  }, [activeQueue, filter]);

  const waitingCustomers = useMemo(() => {
    return activeQueue.filter((entry) => entry.status === "WAITING");
  }, [activeQueue]);

  const calledCustomers = useMemo(() => {
    return activeQueue.filter((entry) => entry.status === "CALLED");
  }, [activeQueue]);

  const seatedCustomers = useMemo(() => {
    return activeQueue.filter((entry) => entry.status === "SEATED");
  }, [activeQueue]);

  const availableTables = useMemo(() => {
    return tables.filter(
      (table: DashboardTable) => table.status === "AVAILABLE",
    );
  }, [tables]);

  function getSuitableWaitingCount(table: DashboardTable) {
    return waitingCustomers.filter(
      (customer) => customer.guestCount <= table.capacity,
    ).length;
  }

  function openActionMenu(
    event: MouseEvent<HTMLButtonElement>,
    entryId: string,
  ) {
    const rect = event.currentTarget.getBoundingClientRect();

    const menuWidth = 160;
    const menuHeight = 56;
    const gap = 8;
    const padding = 8;

    let left = rect.right - menuWidth;
    let top = rect.bottom + gap;

    if (left < padding) {
      left = padding;
    }

    if (left + menuWidth > window.innerWidth - padding) {
      left = window.innerWidth - menuWidth - padding;
    }

    if (top + menuHeight > window.innerHeight - padding) {
      top = rect.top - menuHeight - gap;
    }

    setMenuPosition({
      top,
      left,
    });

    setOpenMenuId((current) => (current === entryId ? null : entryId));
  }

  function closeActionMenu() {
    setOpenMenuId(null);
    setMenuPosition(null);
  }

  async function handleRefresh() {
    closeActionMenu();

    await Promise.all([refetchQueue(), refetchSummary(), refetchTables()]);
  }

  async function handleCallNext(tableId: string) {
    try {
      closeActionMenu();

      await callNext.mutateAsync({
        tableId,
      });

      await Promise.all([refetchQueue(), refetchSummary(), refetchTables()]);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to call the next customer.",
      );
    }
  }

  async function handleSeatCustomer(entry: QueueEntry) {
    try {
      closeActionMenu();

      await markSeated.mutateAsync(entry.id);

      await Promise.all([refetchQueue(), refetchSummary(), refetchTables()]);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Unable to seat the customer.",
      );
    }
  }

  async function handleCancel(entry: QueueEntry) {
    const confirmed = window.confirm(
      `Cancel ${entry.customerName}'s queue entry?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      closeActionMenu();

      await cancelQueue.mutateAsync(entry.id);

      await Promise.all([refetchQueue(), refetchSummary(), refetchTables()]);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to cancel the queue entry.",
      );
    }
  }

  const isLoading =
    workspaceLoading || queueLoading || summaryLoading || tablesLoading;

  const isRefreshing = queueFetching || summaryFetching || tablesFetching;

  const totalWaiting = summary?.waiting ?? waitingCustomers.length;

  const totalCalled = summary?.called ?? calledCustomers.length;

  const totalSeated = summary?.seated ?? seatedCustomers.length;

  async function handleOpenSession(entry: QueueEntry) {
    if (!organizationId || !branchId) {
      window.alert("No active workspace is selected.");
      return;
    }

    if (!entry.tableId) {
      window.alert("This seated customer does not have an assigned table.");
      return;
    }

    try {
      const session = await tableSessionService.getActiveSession(
        organizationId,
        branchId,
        entry.tableId,
      );

      if (!session) {
        window.alert("No active table session was found for this table.");
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
  }

  return (
    <main className="space-y-6">
      {/* HEADER */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#A08F80]">
            Queue
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#2B2118]">
            Waiting Queue
          </h1>

          <p className="mt-1 text-sm text-[#8D7F73]">
            Manage walk-ins and waiting customers
            {activeMembership?.branch?.name
              ? ` for ${activeMembership.branch.name}.`
              : "."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-4 text-sm font-medium text-[#6F4E37] transition hover:bg-[#FAF6F1] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </section>

      {/* SUMMARY */}
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Waiting"
          value={totalWaiting}
          icon={<Clock3 className="h-5 w-5" />}
        />

        <SummaryCard
          label="Called"
          value={totalCalled}
          icon={<Users className="h-5 w-5" />}
        />

        <SummaryCard
          label="Seated"
          value={totalSeated}
          icon={<Check className="h-5 w-5" />}
        />
      </section>

      {/* AVAILABLE TABLES */}
      <section className="rounded-[26px] border border-[#E7DCCE] bg-[#FFFDF9] p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-[#2B2118]">
            Available tables
          </h2>

          <p className="mt-1 text-xs text-[#94877A]">
            Choose a table to call the oldest suitable waiting customer.
          </p>
        </div>

        {availableTables.length === 0 ? (
          <div className="rounded-2xl bg-[#F8F2EC] px-5 py-8 text-center">
            <p className="text-sm font-medium text-[#6F6258]">
              No tables are currently available.
            </p>

            <p className="mt-1 text-xs text-[#A09185]">
              Waiting customers will remain in the queue until a suitable table
              becomes available.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {availableTables.map((table: DashboardTable) => {
              const suitableCount = getSuitableWaitingCount(table);

              const canCall = suitableCount > 0 && !callNext.isPending;

              return (
                <div
                  key={table.id}
                  className="rounded-2xl border border-[#E7DCCE] bg-[#FAF6F1] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[#2B2118]">
                        {table.name}
                      </h3>

                      <p className="mt-1 text-xs text-[#918276]">
                        {table.capacity} seats
                      </p>
                    </div>

                    <span className="rounded-full bg-[#E8F3E9] px-2.5 py-1 text-[11px] font-medium text-[#3D6D42]">
                      Available
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#FFFDF9] px-3 py-3">
                    <p className="text-[11px] text-[#A08F80]">
                      Suitable waiting customers
                    </p>

                    <p className="mt-1 text-lg font-semibold text-[#2B2118]">
                      {suitableCount}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!canCall}
                    onClick={() => handleCallNext(table.id)}
                    className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white transition hover:bg-[#5E402E] disabled:cursor-not-allowed disabled:bg-[#B9AA9C] disabled:text-white"
                  >
                    {callNext.isPending
                      ? "Calling..."
                      : canCall
                        ? "Call next"
                        : "No suitable customer"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FILTERS */}
      <section className="flex gap-2 overflow-x-auto pb-1">
        {[
          {
            key: "ALL" as const,
            label: "All",
            count: activeQueue.length,
          },
          {
            key: "WAITING" as const,
            label: "Waiting",
            count: totalWaiting,
          },
          {
            key: "CALLED" as const,
            label: "Called",
            count: totalCalled,
          },
          {
            key: "SEATED" as const,
            label: "Seated",
            count: totalSeated,
          },
        ].map((item) => {
          const active = filter === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                closeActionMenu();
                setFilter(item.key);
              }}
              className={`
                inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all
                ${
                  active
                    ? "bg-[#6F4E37] text-white shadow-sm"
                    : "border border-[#E7DCCE] bg-[#FFFDF9] text-[#75685D] hover:bg-[#FAF6F1]"
                }
              `}
            >
              {item.label}

              <span
                className={`
                  rounded-full px-1.5 py-0.5 text-[10px]
                  ${
                    active
                      ? "bg-white/15 text-white"
                      : "bg-[#F0E6DA] text-[#6F4E37]"
                  }
                `}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </section>

      {/* QUEUE TABLE */}
      <section className="overflow-hidden rounded-[26px] border border-[#E7DCCE] bg-[#FFFDF9] shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E9DFD5] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#2B2118]">
              Today&apos;s queue
            </h2>

            <p className="mt-1 text-xs text-[#94877A]">
              Customers currently in the queue.
            </p>
          </div>

          <span className="rounded-full bg-[#F4ECE4] px-2.5 py-1 text-[11px] font-semibold text-[#6F4E37]">
            {filteredQueue.length}
          </span>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[#8D7F73]">Loading queue...</p>
          </div>
        ) : queueError ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-[#8A4A4A]">
              Unable to load today&apos;s queue.
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-[#E7DCCE] bg-[#FFFDF9] px-3 text-xs font-medium text-[#6F4E37] hover:bg-[#FAF6F1]"
            >
              Try again
            </button>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Users className="mx-auto h-7 w-7 text-[#B6A89B]" />

            <p className="mt-3 text-sm font-semibold text-[#5F5247]">
              No customers in this view
            </p>

            <p className="mt-1 text-xs text-[#95877A]">
              New walk-ins will appear here when they join the queue.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#E9DFD5] text-left text-[11px] uppercase tracking-[0.12em] text-[#A08F80]">
                    <th className="px-5 py-3 font-medium">#</th>

                    <th className="px-5 py-3 font-medium">Customer</th>

                    <th className="px-5 py-3 font-medium">Guests</th>

                    <th className="px-5 py-3 font-medium">Status</th>

                    <th className="px-5 py-3 font-medium">Table</th>

                    <th className="px-5 py-3 font-medium">Waiting</th>

                    <th className="w-16 px-5 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {filteredQueue.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-[#F0E7DE] last:border-b-0"
                    >
                      <td className="px-5 py-4 align-middle">
                        <span className="text-sm font-medium text-[#6A5D52]">
                          #{entry.queueNumber}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#2B2118]">
                            {entry.customerName}
                          </p>

                          {entry.customerPhone && (
                            <p className="mt-1 text-xs text-[#94877A]">
                              {entry.customerPhone}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-1.5 text-sm text-[#5F5247]">
                          <Users className="h-4 w-4 text-[#9A8C80]" />

                          {entry.guestCount}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <span
                          className={`
                              inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold
                              ${getStatusClasses(entry.status)}
                            `}
                        >
                          {formatStatus(entry.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        {entry.table ? (
                          <div>
                            <p className="text-sm font-medium text-[#4B3E35]">
                              {entry.table.name}
                            </p>

                            <p className="mt-1 text-xs text-[#9A8C80]">
                              {entry.table.capacity} seats
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-[#9A8C80]">
                            Waiting for table
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <span className="text-sm text-[#5F5247]">
                          {entry.status === "SEATED"
                            ? "—"
                            : formatWaitingMinutes(entry.joinedAt)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right align-middle">
                        {entry.status === "CALLED" ? (
                          <button
                            type="button"
                            onClick={() => handleSeatCustomer(entry)}
                            disabled={markSeated.isPending}
                            className="inline-flex h-9 items-center justify-center rounded-xl bg-[#6F4E37] px-4 text-xs font-semibold text-white transition hover:bg-[#5E402E] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {markSeated.isPending
                              ? "Seating..."
                              : "Seat customer"}
                          </button>
                        ) : entry.status === "SEATED" ? (
                          <button
                            type="button"
                            onClick={() => handleOpenSession(entry)}
                            className="inline-flex h-9 items-center justify-center rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3.5 text-xs font-semibold text-[#6F4E37] transition hover:bg-[#F7F0E9]"
                          >
                            Open session
                          </button>
                        ) : entry.status === "WAITING" ? (
                          <button
                            type="button"
                            onClick={(event) => openActionMenu(event, entry.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#8E8176] transition hover:bg-[#F4ECE4] hover:text-[#6F4E37]"
                            aria-label={`Actions for ${entry.customerName}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="divide-y divide-[#F0E7DE] lg:hidden">
              {filteredQueue.map((entry) => (
                <div key={entry.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#9A8C80]">
                          #{entry.queueNumber}
                        </span>

                        <span
                          className={`
                              inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold
                              ${getStatusClasses(entry.status)}
                            `}
                        >
                          {formatStatus(entry.status)}
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm font-semibold text-[#2B2118]">
                        {entry.customerName}
                      </p>

                      {entry.customerPhone && (
                        <p className="mt-1 text-xs text-[#94877A]">
                          {entry.customerPhone}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-xs text-[#918276]">
                      {entry.guestCount}{" "}
                      {entry.guestCount === 1 ? "guest" : "guests"}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#FAF6F1] px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-[#A08F80]">
                        Table
                      </p>

                      <p className="mt-1 text-xs font-medium text-[#5F5247]">
                        {entry.table ? entry.table.name : "Waiting"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FAF6F1] px-3 py-3">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-[#A08F80]">
                        Waiting
                      </p>

                      <p className="mt-1 text-xs font-medium text-[#5F5247]">
                        {entry.status === "SEATED"
                          ? "—"
                          : formatWaitingMinutes(entry.joinedAt)}
                      </p>
                    </div>
                  </div>

                  {entry.status === "CALLED" && (
                    <button
                      type="button"
                      onClick={() => handleSeatCustomer(entry)}
                      disabled={markSeated.isPending}
                      className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white transition hover:bg-[#5E402E] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {markSeated.isPending ? "Seating..." : "Seat customer"}
                    </button>
                  )}

                  {entry.status === "WAITING" && (
                    <button
                      type="button"
                      onClick={(event) => openActionMenu(event, entry.id)}
                      className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#E7DCCE] bg-[#FFFDF9] text-sm font-medium text-[#6F4E37] transition hover:bg-[#F7F0E9]"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      Actions
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* PORTAL ACTION MENU */}
      {openMenuId &&
        menuPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[9999] w-40 rounded-xl border border-[#E7DCCE] bg-[#FFFDF9] p-1.5 shadow-[0_18px_45px_rgba(43,33,24,0.16)]"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
          >
            {(() => {
              const entry = activeQueue.find((item) => item.id === openMenuId);

              if (!entry) {
                return null;
              }

              return (
                <button
                  type="button"
                  onClick={() => handleCancel(entry)}
                  disabled={cancelQueue.isPending}
                  className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#8A4A4A] transition hover:bg-[#FBEAEA] disabled:opacity-50"
                >
                  {cancelQueue.isPending ? "Cancelling..." : "Cancel"}
                </button>
              );
            })()}
          </div>,
          document.body,
        )}
    </main>
  );
}
