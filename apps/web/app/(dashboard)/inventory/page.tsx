"use client";

import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { InventoryItemModal } from "@/components/inventory/inventory-item-modal";
import { useWorkspace } from "@/hooks/auth/use-workspace";
import { useArchiveInventoryItem } from "@/hooks/inventory/use-archive-inventory-item";
import { useCreateInventoryItem } from "@/hooks/inventory/use-create-inventory-item";
import { useInventoryItems } from "@/hooks/inventory/use-inventory-items";
import { useInventoryLowStock } from "@/hooks/inventory/use-inventory-low-stock";
import { useUpdateInventoryItem } from "@/hooks/inventory/use-update-inventory-item";
import { InventoryMovementModal } from "@/components/inventory/inventory-movement-modal";
import { useCreateInventoryMovement } from "@/hooks/inventory/use-create-inventory-movement";
import type { CreateInventoryMovementPayload } from "@/types/inventory";
import { InventoryMovementHistory } from "@/components/inventory/inventory-movement-history";
import { useRestoreInventoryItem } from "@/hooks/inventory/use-restore-inventory-item";

import type {
  CreateInventoryItemPayload,
  InventoryItem,
  UpdateInventoryItemPayload,
} from "@/types/inventory";

type Filter = "ACTIVE" | "LOW_STOCK" | "ARCHIVED" | "ALL";

type MenuPosition = {
  top: number;
  left: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 3,
  }).format(value);
}

function isLowStock(item: InventoryItem) {
  return (
    item.isActive &&
    item.minimumStock > 0 &&
    item.currentStock <= item.minimumStock
  );
}

export default function InventoryPage() {
  const { activeMembership, isLoading: workspaceLoading } = useWorkspace();

  const organizationId = activeMembership?.organization?.id;

  const branchId = activeMembership?.branch?.id;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ACTIVE");

  const [itemModalOpen, setItemModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    left: 0,
  });

  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<
    "IN" | "ADJUSTMENT" | "WASTE" | null
  >(null);
  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null);

  const menuButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const itemsQuery = useInventoryItems(organizationId, branchId);

  const lowStockQuery = useInventoryLowStock(organizationId, branchId);

  const createItem = useCreateInventoryItem(organizationId, branchId);

  const updateItem = useUpdateInventoryItem(organizationId, branchId);

  const archiveItem = useArchiveInventoryItem(organizationId, branchId);

  const items = itemsQuery.data ?? [];
  const lowStockItems = lowStockQuery.data ?? [];

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items
      .filter((item) => {
        switch (filter) {
          case "ACTIVE":
            return item.isActive;

          case "LOW_STOCK":
            return isLowStock(item);

          case "ARCHIVED":
            return !item.isActive;

          case "ALL":
          default:
            return true;
        }
      })
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        const name = item.name.toLowerCase();
        const sku = item.sku?.toLowerCase() ?? "";

        return (
          name.includes(normalizedSearch) || sku.includes(normalizedSearch)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, filter, search]);

  const activeCount = items.filter((item) => item.isActive).length;

  const archivedCount = items.filter((item) => !item.isActive).length;

  const lowStockCount = lowStockItems.filter(
    (item) =>
      item.isActive &&
      item.minimumStock > 0 &&
      item.currentStock <= item.minimumStock,
  ).length;

  const openMenuItem = useMemo(() => {
    if (!openMenuId) {
      return null;
    }

    return items.find((item) => item.id === openMenuId) ?? null;
  }, [items, openMenuId]);

  function openCreateModal() {
    setOpenMenuId(null);
    setEditingItem(null);
    setItemModalOpen(true);
  }

  function openEditModal(item: InventoryItem) {
    setOpenMenuId(null);
    setEditingItem(item);
    setItemModalOpen(true);
  }

  function closeItemModal() {
    if (createItem.isPending || updateItem.isPending) {
      return;
    }

    setItemModalOpen(false);
    setEditingItem(null);
  }

  function openHistoryModal(item: InventoryItem) {
    setOpenMenuId(null);
    setHistoryItem(item);
  }

  function closeHistoryModal() {
    setHistoryItem(null);
  }

  async function handleSubmit(
    payload: CreateInventoryItemPayload | UpdateInventoryItemPayload,
  ) {
    if (editingItem) {
      await updateItem.mutateAsync({
        inventoryItemId: editingItem.id,
        payload: payload as UpdateInventoryItemPayload,
      });
    } else {
      await createItem.mutateAsync(payload as CreateInventoryItemPayload);
    }

    setItemModalOpen(false);
    setEditingItem(null);
  }

  async function handleArchive(item: InventoryItem) {
    const confirmed = window.confirm(`Archive ${item.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      await archiveItem.mutateAsync(item.id);
      setOpenMenuId(null);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to archive inventory item.",
      );
    }
  }

  function handleOpenMenu(itemId: string, button: HTMLButtonElement) {
    if (openMenuId === itemId) {
      setOpenMenuId(null);
      return;
    }

    const rect = button.getBoundingClientRect();

    const menuWidth = 176;
    const menuHeight = 108;
    const gap = 8;
    const padding = 12;

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

    if (top < padding) {
      top = padding;
    }

    setMenuPosition({
      top,
      left,
    });

    setOpenMenuId(itemId);
  }

  const isLoading = workspaceLoading || itemsQuery.isLoading;

  const isRefreshing = itemsQuery.isFetching || lowStockQuery.isFetching;

  function openMovementModal(
    item: InventoryItem,
    type: "IN" | "ADJUSTMENT" | "WASTE",
  ) {
    setOpenMenuId(null);
    setMovementItem(item);
    setMovementType(type);
    setMovementModalOpen(true);
  }

  function closeMovementModal() {
    setMovementModalOpen(false);
    setMovementItem(null);
    setMovementType(null);
  }

  const createMovement = useCreateInventoryMovement(organizationId, branchId);

  async function handleMovementSubmit(payload: CreateInventoryMovementPayload) {
    if (!movementItem) return;

    await createMovement.mutateAsync({
      inventoryItemId: movementItem.id,
      payload,
    });

    closeMovementModal();
  }

  const restoreItem = useRestoreInventoryItem(organizationId, branchId);

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9A8C80]">
              Inventory
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-[#2B2118]">
              Stock management
            </h1>

            <p className="mt-1 text-sm text-[#8B7E74]">
              {activeMembership?.branch?.name
                ? `Manage inventory for ${activeMembership.branch.name}.`
                : "Manage inventory for this branch."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void itemsQuery.refetch();
                void lowStockQuery.refetch();
              }}
              disabled={isRefreshing || !organizationId || !branchId}
              className="flex h-10 items-center gap-2 rounded-xl border border-[#DCCFC1] bg-[#FFFDF9] px-3 text-sm font-medium text-[#6F4E37] transition hover:bg-[#F7F1EB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              disabled={!organizationId || !branchId}
              className="flex h-10 items-center gap-2 rounded-xl bg-[#6F4E37] px-4 text-sm font-semibold text-white transition hover:bg-[#5F402D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add item
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* ACTIVE */}
          <div className="rounded-2xl border border-[#E8DED4] bg-[#FFFDF9] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F1EB] text-[#6F4E37]">
                <Package className="h-5 w-5" />
              </div>

              <span className="text-xs font-medium uppercase tracking-wide text-[#9A8C80]">
                Active items
              </span>
            </div>

            <p className="mt-4 text-2xl font-semibold text-[#2B2118]">
              {activeCount}
            </p>

            <p className="mt-1 text-sm text-[#8B7E74]">
              Inventory items currently in use
            </p>
          </div>

          {/* LOW STOCK */}
          <div className="rounded-2xl border border-[#E8DED4] bg-[#FFFDF9] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4D9] text-[#8A6418]">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <span className="text-xs font-medium uppercase tracking-wide text-[#9A8C80]">
                Low stock
              </span>
            </div>

            <p className="mt-4 text-2xl font-semibold text-[#2B2118]">
              {lowStockCount}
            </p>

            <p className="mt-1 text-sm text-[#8B7E74]">
              Items at or below their minimum
            </p>
          </div>

          {/* ARCHIVED */}
          <div className="rounded-2xl border border-[#E8DED4] bg-[#FFFDF9] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEEAE5] text-[#6F6258]">
                <Archive className="h-5 w-5" />
              </div>

              <span className="text-xs font-medium uppercase tracking-wide text-[#9A8C80]">
                Archived
              </span>
            </div>

            <p className="mt-4 text-2xl font-semibold text-[#2B2118]">
              {archivedCount}
            </p>

            <p className="mt-1 text-sm text-[#8B7E74]">Items no longer used</p>
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="overflow-hidden rounded-3xl border border-[#E8DED4] bg-[#FFFDF9] shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#EDE4DC] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#2B2118]">
                Inventory items
              </h2>

              <p className="mt-1 text-sm text-[#8B7E74]">
                {filteredItems.length} item
                {filteredItems.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* SEARCH */}
              <div className="relative min-w-0 sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8C80]" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search items..."
                  className="h-10 w-full rounded-xl border border-[#DCCFC1] bg-white pl-9 pr-3 text-sm text-[#2B2118] outline-none transition placeholder:text-[#B5A79C] focus:border-[#9A7255] focus:ring-2 focus:ring-[#9A7255]/10"
                />
              </div>

              {/* FILTER */}
              <div className="flex rounded-xl border border-[#DCCFC1] bg-white p-1">
                {(
                  [
                    ["ACTIVE", "Active"],
                    ["LOW_STOCK", "Low stock"],
                    ["ARCHIVED", "Archived"],
                    ["ALL", "All"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                      filter === value
                        ? "bg-[#F3E9DF] text-[#6F4E37]"
                        : "text-[#8B7E74] hover:bg-[#F8F4EF]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-sm text-[#8B7E74]">Loading inventory...</p>
            </div>
          ) : itemsQuery.isError ? (
            <div className="p-12 text-center">
              <p className="text-sm font-medium text-[#8A4A4A]">
                Failed to load inventory.
              </p>

              <button
                type="button"
                onClick={() => void itemsQuery.refetch()}
                className="mt-3 text-sm font-medium text-[#6F4E37] underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F1EB] text-[#6F4E37]">
                <Package className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#2B2118]">
                No inventory items found
              </h3>

              <p className="mt-1 text-sm text-[#8B7E74]">
                {search
                  ? "Try a different search term."
                  : filter === "LOW_STOCK"
                    ? "No items are currently at or below the minimum stock."
                    : "Start by adding your first inventory item."}
              </p>

              {!search && filter === "ACTIVE" && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#6F4E37] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5F402D]"
                >
                  <Plus className="h-4 w-4" />
                  Add first item
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-[#FAF6F1]">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#918378]">
                      Item
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#918378]">
                      SKU
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#918378]">
                      Current stock
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#918378]">
                      Minimum
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#918378]">
                      Status
                    </th>

                    <th className="w-12 px-5 py-4" />
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => {
                    const lowStock = isLowStock(item);

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-[#F0E8DF] last:border-b-0"
                      >
                        {/* ITEM */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-semibold text-[#2B2118]">
                              {item.name}
                            </p>

                            <p className="mt-1 text-xs text-[#9A8C80]">
                              Unit: {item.unit}
                            </p>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-5 py-4 text-sm text-[#6F6258]">
                          {item.sku || "—"}
                        </td>

                        {/* CURRENT */}
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-semibold text-[#2B2118]">
                            {formatNumber(item.currentStock)}
                          </span>

                          <span className="ml-1 text-xs text-[#9A8C80]">
                            {item.unit}
                          </span>
                        </td>

                        {/* MINIMUM */}
                        <td className="px-5 py-4 text-right text-sm text-[#6F6258]">
                          {formatNumber(item.minimumStock)} {item.unit}
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          {item.isActive ? (
                            lowStock ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4D9] px-2.5 py-1 text-xs font-semibold text-[#8A6418]">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Low stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F3E9] px-2.5 py-1 text-xs font-semibold text-[#3D6D42]">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Healthy
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEEAE5] px-2.5 py-1 text-xs font-semibold text-[#6F6258]">
                              <Archive className="h-3.5 w-3.5" />
                              Archived
                            </span>
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-4 text-right">
                          <button
                            ref={(element) => {
                              menuButtonRefs.current[item.id] = element;
                            }}
                            type="button"
                            onClick={(event) =>
                              handleOpenMenu(item.id, event.currentTarget)
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#8B7E74] transition hover:bg-[#F7F1EB] hover:text-[#4B3E35]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {movementModalOpen && movementItem && movementType && (
        <InventoryMovementModal
          item={movementItem}
          type={movementType}
          loading={createMovement.isPending}
          onClose={closeMovementModal}
          onSubmit={handleMovementSubmit}
        />
      )}

      {historyItem && (
        <InventoryMovementHistory
          organizationId={organizationId}
          branchId={branchId}
          item={historyItem}
          onClose={closeHistoryModal}
        />
      )}

      {/* ITEM MODAL */}
      {itemModalOpen && (
        <InventoryItemModal
          item={editingItem}
          loading={createItem.isPending || updateItem.isPending}
          onClose={closeItemModal}
          onSubmit={handleSubmit}
        />
      )}

      {/* PORTALED ACTION MENU */}
      {openMenuItem &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[100] w-44 overflow-hidden rounded-2xl border border-[#E8DED4] bg-[#FFFDF9] p-1.5 shadow-xl"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
          >
            <button
              type="button"
              onClick={() => openEditModal(openMenuItem)}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#4B3E35] transition hover:bg-[#F7F1EB]"
            >
              Edit item
            </button>

            {openMenuItem.isActive ? (
              <>
                <button
                  type="button"
                  onClick={() => openMovementModal(openMenuItem, "IN")}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#4B3E35] transition hover:bg-[#F7F1EB]"
                >
                  Receive stock
                </button>

                <button
                  type="button"
                  onClick={() => openMovementModal(openMenuItem, "ADJUSTMENT")}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#4B3E35] transition hover:bg-[#F7F1EB]"
                >
                  Adjust stock
                </button>

                <button
                  type="button"
                  onClick={() => openMovementModal(openMenuItem, "WASTE")}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#4B3E35] transition hover:bg-[#F7F1EB]"
                >
                  Record waste
                </button>

                <button
                  type="button"
                  onClick={() => openHistoryModal(openMenuItem)}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#4B3E35] transition hover:bg-[#F7F1EB]"
                >
                  View history
                </button>

                <div className="my-1 border-t border-[#EDE4DC]" />

                <button
                  type="button"
                  onClick={() => {
                    void handleArchive(openMenuItem);
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#9B604F] transition hover:bg-[#FBF0EB]"
                >
                  Archive item
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const confirmed = window.confirm(
                    `Restore ${openMenuItem.name}?`,
                  );

                  if (!confirmed) {
                    return;
                  }

                  void restoreItem
                    .mutateAsync(openMenuItem.id)
                    .then(() => {
                      setOpenMenuId(null);
                    })
                    .catch((error) => {
                      window.alert(
                        error instanceof Error
                          ? error.message
                          : "Failed to restore inventory item.",
                      );
                    });
                }}
                disabled={restoreItem.isPending}
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#4B3E35] transition hover:bg-[#F7F1EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {restoreItem.isPending ? "Restoring..." : "Restore item"}
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
