"use client";

import {
  Armchair,
  Archive,
  Clock3,
  Edit3,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Users,
  QrCode,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CoffeeLoading } from "@/components/ui/coffee-loading";
import { TableFormModal } from "@/components/tables/table-form-modal";

import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useTables } from "@/hooks/tables/use-tables";
import { useCreateTable } from "@/hooks/tables/use-create-table";
import { useUpdateTable } from "@/hooks/tables/use-update-table";
import { useArchiveTable } from "@/hooks/tables/use-archive-table";
import { TableQrDialog } from "@/components/tables/table-qr-dialog";

import { tableSessionService } from "@/services/table-session.service";

import type { DashboardTable } from "@/types/dashboard";

type TableFilter = "ALL" | "AVAILABLE" | "OCCUPIED" | "UNAVAILABLE";

function formatCurrency(value: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function TablesPage() {
  const router = useRouter();

  const { activeMembership, isLoading: workspaceLoading } = useWorkspace();

  const organizationId = activeMembership?.organization?.id;

  const branchId = activeMembership?.branch?.id;

  const {
    data: tables = [],
    isLoading: tablesLoading,
    isError,
    refetch,
    isFetching,
  } = useTables({
    organizationId,
    branchId,
  });

  const [filter, setFilter] = useState<TableFilter>("ALL");

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editingTable, setEditingTable] = useState<DashboardTable | null>(null);

  const [archivingTable, setArchivingTable] = useState<DashboardTable | null>(
    null,
  );

  const [qrTable, setQrTable] = useState<DashboardTable | null>(null);

  const [openingTableId, setOpeningTableId] = useState<string | null>(null);

  const [openMenuTableId, setOpenMenuTableId] = useState<string | null>(null);

  /**
   * TABLE MUTATIONS
   */
  const createTable = useCreateTable(organizationId!, branchId!);

  const updateTable = useUpdateTable({
    organizationId: organizationId!,
    branchId: branchId!,
  });

  const archiveTable = useArchiveTable({
    organizationId: organizationId!,
    branchId: branchId!,
  });

  /**
   * FILTER COUNTS
   */
  const counts = useMemo(() => {
    return {
      all: tables.length,

      available: tables.filter(
        (table: DashboardTable) => table.status === "AVAILABLE",
      ).length,

      occupied: tables.filter(
        (table: DashboardTable) => table.status === "OCCUPIED",
      ).length,

      unavailable: tables.filter(
        (table: DashboardTable) => table.status === "UNAVAILABLE",
      ).length,
    };
  }, [tables]);

  /**
   * VISIBLE TABLES
   */
  const visibleTables = useMemo(() => {
    if (filter === "ALL") {
      return tables;
    }

    return tables.filter((table: DashboardTable) => table.status === filter);
  }, [tables, filter]);

  /**
   * OPEN TABLE
   */
  async function handleOpenTable(tableId: string) {
    if (!organizationId || !branchId) {
      return;
    }

    try {
      setOpeningTableId(tableId);

      const session = await tableSessionService.openSession(
        organizationId,
        branchId,
        tableId,
      );

      router.push(`/tables/session/${session.id}`);
    } catch {
      await refetch();
    } finally {
      setOpeningTableId(null);
    }
  }

  /**
   * CREATE / UPDATE
   */
  async function handleTableSubmit(payload: {
    name: string;
    capacity: number;
    location?: string;
    photoUrl?: string;
    customerSelectable?: boolean;
  }) {
    if (editingTable) {
      await updateTable.mutateAsync({
        tableId: editingTable.id,
        payload,
      });

      setEditingTable(null);
      return;
    }

    await createTable.mutateAsync(payload);
    setIsCreateOpen(false);
  }

  /**
   * ARCHIVE
   */
  async function handleArchiveTable() {
    if (!archivingTable) {
      return;
    }

    try {
      await archiveTable.mutateAsync(archivingTable.id);

      setArchivingTable(null);
    } catch {
      // React Query exposes the error through archiveTable.error.
    }
  }

  /**
   * LOADING
   */
  if (workspaceLoading || tablesLoading) {
    return (
      <div className="pt-6">
        <CoffeeLoading />
      </div>
    );
  }

  /**
   * ERROR
   */
  if (!activeMembership?.branch || isError) {
    return (
      <div className="space-y-5 pt-4">
        <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-8 text-center">
          <p className="text-sm font-semibold text-[#6F4E37]">
            We couldn&apos;t load the tables.
          </p>

          <p className="mt-1 text-sm text-[#94877A]">
            Please refresh and try again.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#5E402E]"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pt-4 pb-10">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9A8C80]">
              Floor
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#2B2118]">
              Tables
            </h1>

            <p className="mt-1 text-sm text-[#85786C]">
              Manage your floor at a glance for {activeMembership.branch.name}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#5E402E]"
            >
              <Plus className="h-4 w-4" />
              Add table
            </button>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3.5 text-sm font-medium text-[#6F4E37] transition-colors hover:bg-[#FAF6F1] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <section className="flex gap-2 overflow-x-auto pb-1">
          {[
            {
              key: "ALL" as const,
              label: "All",
              count: counts.all,
            },
            {
              key: "AVAILABLE" as const,
              label: "Available",
              count: counts.available,
            },
            {
              key: "OCCUPIED" as const,
              label: "Occupied",
              count: counts.occupied,
            },
            {
              key: "UNAVAILABLE" as const,
              label: "Unavailable",
              count: counts.unavailable,
            },
          ].map((item) => {
            const active = filter === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
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

        {/* TABLE GRID */}
        {visibleTables.length === 0 ? (
          <div className="rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] px-6 py-14 text-center">
            <Armchair className="mx-auto h-7 w-7 text-[#B7A99B]" />

            <p className="mt-3 text-sm font-semibold text-[#5E5248]">
              No tables found
            </p>

            <p className="mt-1 text-sm text-[#94877A]">
              There are no tables in this view yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visibleTables.map((table: DashboardTable) => {
              const isAvailable = table.status === "AVAILABLE";

              const isOccupied = table.status === "OCCUPIED";

              const isUnavailable = table.status === "UNAVAILABLE";

              const session = table.activeSession;

              const hasOrders = Boolean(session && session.orderCount > 0);

              return (
                <article
                  key={table.id}
                  className={`
                      relative rounded-[26px] border bg-[#FFFDF9] p-5 transition-all duration-200
                      ${
                        isUnavailable
                          ? "border-[#E4DDD7] opacity-80"
                          : "border-[#E7DCCE] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(70,45,25,0.07)]"
                      }
                    `}
                >
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-[#2B2118]">
                        {table.name}
                      </h2>

                      <div className="mt-1 flex items-center gap-3 text-xs text-[#93867A]">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {table.capacity} seats
                        </span>

                        {table.location && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <MapPin className="h-3.5 w-3.5" />
                            {table.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MENU */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuTableId((current) =>
                            current === table.id ? null : table.id,
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-[#887B70] transition-colors hover:bg-[#F4ECE4] hover:text-[#6F4E37]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {openMenuTableId === table.id && (
                        <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-2xl border border-[#E7DCCE] bg-[#FFFDF9] p-1.5 shadow-[0_15px_40px_rgba(43,33,24,0.12)]">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTable(table);
                              setOpenMenuTableId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#5C5047] hover:bg-[#F6EFE8]"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit table
                          </button>

                          <button
                            type="button"
                            onClick={() => setQrTable(table)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#4F4339] hover:bg-[#F5EFE9]"
                          >
                            <QrCode className="h-4 w-4" />
                            View QR
                          </button>

                          {isAvailable && (
                            <button
                              type="button"
                              onClick={() => setOpenMenuTableId(null)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#5C5047] hover:bg-[#F6EFE8]"
                            >
                              Mark unavailable
                            </button>
                          )}

                          {isUnavailable && (
                            <button
                              type="button"
                              onClick={() => setOpenMenuTableId(null)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#5C5047] hover:bg-[#F6EFE8]"
                            >
                              Mark available
                            </button>
                          )}

                          {isOccupied && (
                            <div className="px-3 py-2.5 text-[11px] leading-4 text-[#9A8C80]">
                              Close the active table session before changing its
                              availability.
                            </div>
                          )}

                          {!isOccupied && (
                            <button
                              type="button"
                              onClick={() => {
                                setArchivingTable(table);
                                setOpenMenuTableId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#9B604F] hover:bg-[#FBF0EB]"
                            >
                              <Archive className="h-3.5 w-3.5" />
                              Archive table
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="mt-5 flex items-center gap-2">
                    <span
                      className={`
                          h-2.5 w-2.5 rounded-full
                          ${
                            isAvailable
                              ? "bg-[#8CB38C]"
                              : isOccupied
                                ? "bg-[#D6A05A]"
                                : "bg-[#958A81]"
                          }
                        `}
                    />

                    <span className="text-sm font-semibold text-[#4C4036]">
                      {isAvailable
                        ? "Available"
                        : isOccupied
                          ? "Occupied"
                          : "Unavailable"}
                    </span>
                  </div>

                  {/* SESSION */}
                  {isOccupied && session && (
                    <div className="mt-4 rounded-2xl border border-[#E8DED4] bg-[#FAF6F1] p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8C7E73]">Orders</span>

                        <span className="text-sm font-semibold text-[#4A3C31]">
                          {session.orderCount}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-[#8C7E73]">
                          Session total
                        </span>

                        <span className="text-sm font-semibold text-[#4A3C31]">
                          {formatCurrency(session.total)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-[#8C7E73]">
                          Outstanding
                        </span>

                        <span
                          className={`
                            text-sm font-semibold
                            ${
                              !hasOrders
                                ? "text-[#8C7E73]"
                                : session.outstandingTotal > 0
                                  ? "text-[#9B604F]"
                                  : "text-[#657765]"
                            }
                          `}
                        >
                          {!hasOrders
                            ? "No orders yet"
                            : session.outstandingTotal > 0
                              ? formatCurrency(session.outstandingTotal)
                              : "Paid in full"}
                        </span>
                      </div>

                      <div className="mt-3 border-t border-[#E7DCCE] pt-3">
                        <p className="inline-flex items-center gap-1 text-[11px] text-[#978A7E]">
                          <Clock3 className="h-3 w-3" />
                          Opened {formatTime(session.openedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="overflow-hidden rounded-2xl border border-[#E7DCCE] bg-[#FFFDF9] shadow-sm">
                    {/* Table Image */}
                    <div className="relative h-40 w-full overflow-hidden bg-[#F7F3ED]">
                      {table.photoUrl ? (
                        <img
                          src={table.photoUrl}
                          alt={table.name}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="text-4xl opacity-40">🪑</div>
                        </div>
                      )}

                      {/* Status badge */}
                      <div className="absolute right-3 top-3">
                        {/* existing status badge */}
                      </div>
                    </div>
                  </div>

                  {/* ACTION */}
                  <div className="mt-5">
                    {isAvailable && (
                      <button
                        type="button"
                        onClick={() => handleOpenTable(table.id)}
                        disabled={openingTableId === table.id}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#5E402E] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {openingTableId === table.id ? (
                          <>
                            <Clock3 className="h-4 w-4 animate-pulse" />
                            Opening...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Open table
                          </>
                        )}
                      </button>
                    )}

                    {isOccupied && session && (
                      <Link
                        href={`/tables/session/${session.id}`}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#DCCFC1] bg-[#FAF6F1] px-4 text-sm font-semibold text-[#6F4E37] transition-colors hover:bg-[#F3E9DF]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View table
                      </Link>
                    )}

                    {isUnavailable && (
                      <div className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#F1ECE8] text-sm font-medium text-[#887B70]">
                        <XCircle className="h-4 w-4" />
                        Out of service
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {organizationId && (
        <TableFormModal
          key={editingTable?.id ?? (isCreateOpen ? "create" : "closed")}
          organizationId={organizationId}
          open={isCreateOpen || Boolean(editingTable)}
          table={editingTable}
          loading={createTable.isPending || updateTable.isPending}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingTable(null);
          }}
          onSubmit={handleTableSubmit}
        />
      )}

      {/* ARCHIVE CONFIRMATION */}
      {archivingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2118]/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-[#E7DCCE] bg-[#FFFDF9] p-6 shadow-[0_25px_70px_rgba(43,33,24,0.18)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8EEE9] text-[#9B604F]">
              <Archive className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-[#2B2118]">
              Archive {archivingTable.name}?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#85786C]">
              This table will be removed from the active floor. Historical
              orders and records will remain intact.
            </p>

            {archiveTable.isError && (
              <div className="mt-4 rounded-xl bg-[#8B4A3C] px-3 py-2.5 text-xs text-[#FFE8E1]">
                {archiveTable.error instanceof Error
                  ? archiveTable.error.message
                  : "Unable to archive this table."}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setArchivingTable(null)}
                className="h-10 rounded-xl border border-[#DCCFC1] px-4 text-sm font-medium text-[#6F4E37] hover:bg-[#F7F1EB]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleArchiveTable}
                disabled={archiveTable.isPending}
                className="h-10 rounded-xl bg-[#9B604F] px-4 text-sm font-semibold text-white hover:bg-[#875141] disabled:opacity-50"
              >
                {archiveTable.isPending ? "Archiving..." : "Archive table"}
              </button>
            </div>
          </div>
        </div>
      )}

      {branchId && (
        <TableQrDialog
          open={Boolean(qrTable)}
          table={
            qrTable
              ? {
                  name: qrTable.name,
                  location: qrTable.location,
                  qrToken: qrTable.qrToken,
                }
              : null
          }
          branchId={branchId}
          onClose={() => setQrTable(null)}
        />
      )}
    </>
  );
}
