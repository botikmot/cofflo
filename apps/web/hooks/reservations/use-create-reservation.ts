"use client";

import { useMutation } from "@tanstack/react-query";

import { reservationService } from "@/services/reservation.service";

import type { CreatePublicReservationPayload } from "@/types/reservation";

export function useCreateReservation(branchId: string) {
  return useMutation({
    mutationFn: (payload: CreatePublicReservationPayload) =>
      reservationService.createPublicReservation(branchId, payload),
  });
}
