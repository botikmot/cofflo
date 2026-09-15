"use client";

import { useQuery } from "@tanstack/react-query";

import { reservationService } from "@/services/reservation.service";

import type { ReservationAvailabilityParams } from "@/types/reservation";

export function useReservationAvailability(
  params: ReservationAvailabilityParams | null,
) {
  return useQuery({
    queryKey: ["reservation-availability", params],
    queryFn: () => reservationService.getAvailability(params!),
    enabled: Boolean(
      params?.branchId &&
      params?.startAt &&
      params?.endAt &&
      params?.guestCount,
    ),
  });
}
