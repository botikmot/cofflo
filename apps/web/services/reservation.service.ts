import { apiFetch } from "@/lib/api";

import type {
  CreatePublicReservationPayload,
  CreateReservationResponse,
  PublicReservation,
  ReservationAvailabilityParams,
  ReservationAvailabilityResponse,
} from "@/types/reservation";

export const reservationService = {
  getAvailability(params: ReservationAvailabilityParams) {
    const searchParams = new URLSearchParams({
      startAt: params.startAt,
      endAt: params.endAt,
      guestCount: String(params.guestCount),
    });

    return apiFetch<ReservationAvailabilityResponse>(
      `/public/branches/${params.branchId}/reservation-availability?${searchParams.toString()}`,
    );
  },

  createPublicReservation(
    branchId: string,
    payload: CreatePublicReservationPayload,
  ) {
    return apiFetch<CreateReservationResponse>(
      `/public/branches/${branchId}/reservations`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  getPublicReservation(publicToken: string) {
    return apiFetch<PublicReservation>(`/public/reservations/${publicToken}`);
  },
};
