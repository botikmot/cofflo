"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reservationService } from "@/services/reservation.service";
import type { CreateReservationPayload } from "@/types/reservation";

export function useCreateDashboardReservation(
  organizationId?: string,
  branchId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReservationPayload) => {
      if (!organizationId || !branchId) {
        throw new Error("No active branch selected.");
      }

      return reservationService.createReservation(
        organizationId,
        branchId,
        payload,
      );
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["reservations", organizationId, branchId],
        }),

        queryClient.invalidateQueries({
          queryKey: ["reservation-availability", organizationId, branchId],
        }),

        queryClient.invalidateQueries({
          queryKey: ["tables", organizationId, branchId],
        }),
      ]);
    },
  });
}
