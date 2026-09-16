import { apiFetch } from "@/lib/api";

import type {
  CreatePublicReservationPayload,
  CreateReservationPayload,
  CreateReservationResponse,
  PublicReservation,
  Reservation,
  ReservationTable,
  ReservationAvailabilityParams,
  ReservationAvailabilityResponse,
  ReservationStatus,
  UpdateReservationPayload,
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

  // =========================
  // DASHBOARD / STAFF
  // =========================

  getReservations(organizationId: string, branchId: string) {
    return apiFetch<Reservation[]>(
      `/organizations/${organizationId}/branches/${branchId}/reservations`,
    );
  },

  getReservation(
    organizationId: string,
    branchId: string,
    reservationId: string,
  ) {
    return apiFetch<Reservation>(
      `/organizations/${organizationId}/branches/${branchId}/reservations/${reservationId}`,
    );
  },

  getAvailableTables(
    organizationId: string,
    branchId: string,
    params: {
      startAt: string;
      endAt: string;
      guestCount: number;
    },
  ) {
    const searchParams = new URLSearchParams({
      startAt: params.startAt,
      endAt: params.endAt,
      guestCount: String(params.guestCount),
    });

    return apiFetch<ReservationTable[]>(
      `/organizations/${organizationId}/branches/${branchId}/reservations/availability?${searchParams.toString()}`,
    );
  },

  createReservation(
    organizationId: string,
    branchId: string,
    payload: CreateReservationPayload,
  ) {
    return apiFetch<Reservation>(
      `/organizations/${organizationId}/branches/${branchId}/reservations`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  updateReservation(
    organizationId: string,
    branchId: string,
    reservationId: string,
    payload: UpdateReservationPayload,
  ) {
    return apiFetch<Reservation>(
      `/organizations/${organizationId}/branches/${branchId}/reservations/${reservationId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  },

  updateReservationStatus(
    organizationId: string,
    branchId: string,
    reservationId: string,
    status: ReservationStatus,
  ) {
    return apiFetch<Reservation>(
      `/organizations/${organizationId}/branches/${branchId}/reservations/${reservationId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
  },
};
