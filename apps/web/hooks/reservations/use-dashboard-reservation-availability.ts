"use client";

import { useQuery } from "@tanstack/react-query";

import { reservationService } from "@/services/reservation.service";

type Params = {
  organizationId?: string;
  branchId?: string;
  startAt?: string;
  endAt?: string;
  guestCount?: number;
};

export function useDashboardReservationAvailability({
  organizationId,
  branchId,
  startAt,
  endAt,
  guestCount,
}: Params) {
  const enabled = Boolean(
    organizationId &&
    branchId &&
    startAt &&
    endAt &&
    guestCount &&
    guestCount > 0,
  );

  return useQuery({
    queryKey: [
      "dashboard-reservation-availability",
      organizationId,
      branchId,
      startAt,
      endAt,
      guestCount,
    ],
    queryFn: () =>
      reservationService.getAvailableTables(organizationId!, branchId!, {
        startAt: startAt!,
        endAt: endAt!,
        guestCount: guestCount!,
      }),
    enabled,
  });
}
