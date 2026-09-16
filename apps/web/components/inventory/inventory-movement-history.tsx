"use client";

import {
  ArrowDown,
  ArrowUp,
  ClipboardList,
  Minus,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import type {
  InventoryItem,
  InventoryMovement,
  InventoryMovementType,
} from "@/types/inventory";

import { useInventoryMovements } from "@/hooks/inventory/use-inventory-movements";

type InventoryMovementHistoryProps = {
  organizationId?: string;
  branchId?: string;
  item: InventoryItem;
  onClose: () => void;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 3,
  }).format(Number(value));
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getMovementMeta(type: InventoryMovementType) {
  switch (type) {
    case "IN":
      return {
        label: "Stock received",
        icon: ArrowDown,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        quantityPrefix: "+",
      };

    case "OUT":
      return {
        label: "Stock issued",
        icon: ArrowUp,
        className: "bg-blue-50 text-blue-700 border-blue-200",
        quantityPrefix: "-",
      };

    case "WASTE":
      return {
        label: "Waste recorded",
        icon: Trash2,
        className: "bg-amber-50 text-amber-700 border-amber-200",
        quantityPrefix: "-",
      };

    case "ADJUSTMENT":
      return {
        label: "Stock adjustment",
        icon: RefreshCw,
        className: "bg-[#F3EBE3] text-[#6F4E37] border-[#E3D5C8]",
        quantityPrefix: "",
      };

    default:
      return {
        label: type,
        icon: ClipboardList,
        className: "bg-slate-50 text-slate-600 border-slate-200",
        quantityPrefix: "",
      };
  }
}

function formatMovementQuantity(movement: InventoryMovement) {
  const quantity = Number(movement.quantity);

  if (movement.type === "ADJUSTMENT") {
    if (quantity > 0) {
      return `+${formatNumber(quantity)}`;
    }

    if (quantity < 0) {
      return formatNumber(quantity);
    }

    return "0";
  }

  const meta = getMovementMeta(movement.type);

  return `${meta.quantityPrefix}${formatNumber(Math.abs(quantity))}`;
}

function MovementRow({
  movement,
  unit,
}: {
  movement: InventoryMovement;
  unit: string;
}) {
  const meta = getMovementMeta(movement.type);
  const Icon = meta.icon;

  return (
    <div className="border-b border-[#EEE5DC] px-5 py-5 last:border-b-0">
      <div className="flex items-start gap-4">
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            ${meta.className}
          `}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#2B2118]">
                {meta.label}
              </p>

              <p className="mt-1 text-xs text-[#9A8C80]">
                {formatDate(movement.createdAt)}
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <p
                className={`
                  text-sm
                  font-semibold
                  ${
                    movement.type === "IN"
                      ? "text-emerald-700"
                      : movement.type === "WASTE" ||
                          (movement.type === "ADJUSTMENT" &&
                            Number(movement.quantity) < 0)
                        ? "text-amber-700"
                        : "text-[#6F4E37]"
                  }
                `}
              >
                {formatMovementQuantity(movement)}{" "}
                <span className="text-xs font-medium text-[#9A8C80]">
                  {unit}
                </span>
              </p>
            </div>
          </div>

          {movement.reason && (
            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#A08F80]">
                Reason
              </p>

              <p className="mt-1 text-sm leading-5 text-[#6F6258]">
                {movement.reason}
              </p>
            </div>
          )}

          {movement.reference && (
            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#A08F80]">
                Reference
              </p>

              <p className="mt-1 break-words text-sm leading-5 text-[#6F6258]">
                {movement.reference}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InventoryMovementHistory({
  organizationId,
  branchId,
  item,
  onClose,
}: InventoryMovementHistoryProps) {
  const movementsQuery = useInventoryMovements(
    organizationId,
    branchId,
    item.id,
  );

  const movements = movementsQuery.data ?? [];

  return (
    <div
      className="
        fixed
        inset-0
        z-[120]
        flex
        items-center
        justify-center
        bg-black/40
        px-4
        py-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-[#E8DED4]
          bg-[#FFFDF9]
          shadow-2xl
        "
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E8DED4] px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9A8C80]">
              Movement history
            </p>

            <h2 className="mt-1 truncate text-xl font-semibold text-[#2B2118]">
              {item.name}
            </h2>

            <p className="mt-1 text-sm text-[#8B7E74]">
              Current stock:{" "}
              <span className="font-semibold text-[#6F4E37]">
                {formatNumber(item.currentStock)} {item.unit}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-[#8B7E74]
              transition
              hover:bg-[#F7F1EB]
              hover:text-[#4B3E35]
            "
            aria-label="Close movement history"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-3 border-b border-[#E8DED4] bg-[#FAF6F1] px-6 py-4 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#9A8C80]">
              Current
            </p>

            <p className="mt-1 text-sm font-semibold text-[#2B2118]">
              {formatNumber(item.currentStock)} {item.unit}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#9A8C80]">
              Minimum
            </p>

            <p className="mt-1 text-sm font-semibold text-[#2B2118]">
              {formatNumber(item.minimumStock)} {item.unit}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#9A8C80]">
              Movements
            </p>

            <p className="mt-1 text-sm font-semibold text-[#2B2118]">
              {movements.length}
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {movementsQuery.isLoading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-[#8B7E74]">
                <div
                  className="
                    h-5
                    w-5
                    animate-spin
                    rounded-full
                    border-2
                    border-[#DCCFC1]
                    border-t-[#6F4E37]
                  "
                />
                Loading movement history...
              </div>
            </div>
          ) : movementsQuery.isError ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F1EB] text-[#6F4E37]">
                <ClipboardList className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-semibold text-[#2B2118]">
                Unable to load movement history
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-[#8B7E74]">
                {movementsQuery.error instanceof Error
                  ? movementsQuery.error.message
                  : "Something went wrong while loading the inventory history."}
              </p>

              <button
                type="button"
                onClick={() => void movementsQuery.refetch()}
                className="
                  mt-4
                  rounded-xl
                  bg-[#6F4E37]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#5F402D]
                "
              >
                Try again
              </button>
            </div>
          ) : movements.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F1EB] text-[#6F4E37]">
                <ClipboardList className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-semibold text-[#2B2118]">
                No movements yet
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-[#8B7E74]">
                Stock received, adjustments, and waste records will appear here.
              </p>
            </div>
          ) : (
            <div>
              {movements.map((movement) => (
                <MovementRow
                  key={movement.id}
                  movement={movement}
                  unit={item.unit}
                />
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end border-t border-[#E8DED4] bg-[#FCF9F5] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              border
              border-[#DCCFC1]
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-[#5E5147]
              transition
              hover:bg-[#F7F1EB]
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
