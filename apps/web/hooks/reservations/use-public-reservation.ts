"use client";

import { useQuery } from "@tanstack/react-query";

import { reservationService } from "@/services/reservation.service";

export function usePublicReservation(publicToken: string) {
  return useQuery({
    queryKey: ["public-reservation", publicToken],
    queryFn: () => reservationService.getPublicReservation(publicToken),
    enabled: Boolean(publicToken),
    refetchInterval: 15_000,
  });
}
