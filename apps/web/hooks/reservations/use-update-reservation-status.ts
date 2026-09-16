"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reservationService } from "@/services/reservation.service";

import type { ReservationStatus } from "@/types/reservation";

export function useUpdateReservationStatus(
  organizationId?: string,
  branchId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reservationId,
      status,
    }: {
      reservationId: string;
      status: ReservationStatus;
    }) => {
      if (!organizationId || !branchId) {
        throw new Error("Active branch is required.");
      }

      return reservationService.updateReservationStatus(
        organizationId,
        branchId,
        reservationId,
        status,
      );
    },

    onSuccess: () => {
      if (!organizationId || !branchId) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["reservations", organizationId, branchId],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-reservation-availability"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tables", organizationId, branchId],
      });
    },
  });
}
