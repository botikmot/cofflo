"use client";

import { useQuery } from "@tanstack/react-query";

import { reservationService } from "@/services/reservation.service";

export function useReservations(organizationId?: string, branchId?: string) {
  return useQuery({
    queryKey: ["reservations", organizationId, branchId],
    queryFn: () =>
      reservationService.getReservations(organizationId!, branchId!),
    enabled: Boolean(organizationId && branchId),
  });
}
