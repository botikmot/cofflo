export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SEATED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type ReservationTable = {
  id: string;
  name: string;
  capacity: number;
  location: string | null;
  photoUrl: string | null;
};

export type PublicReservation = {
  publicToken: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  notes: string | null;
  table: {
    name: string;
    capacity: number;
    location: string | null;
    photoUrl: string | null;
  } | null;
  branch: {
    name: string;
    organization: {
      name: string;
      currency: string;
    };
  };
};

export type ReservationAvailabilityParams = {
  branchId: string;
  startAt: string;
  endAt: string;
  guestCount: number;
};

export type ReservationAvailabilityResponse = {
  branch: {
    id: string;
    name: string;
  };
  organization: {
    id: string;
    name: string;
    currency: string;
  };
  startAt: string;
  endAt: string;
  guestCount: number;
  tables: ReservationTable[];
};

export type CreatePublicReservationPayload = {
  customerName: string;
  customerPhone?: string;
  guestCount: number;
  startAt: string;
  endAt: string;
  tableId?: string;
  notes?: string;
};

export type CreateReservationResponse = {
  publicToken: string;
  customerName: string;
  guestCount: number;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  table: ReservationTable | null;
  branch: {
    id: string;
    name: string;
  };
};

export type Reservation = {
  id: string;
  organizationId: string;
  branchId: string;
  tableId: string | null;

  publicToken: string;

  customerName: string;
  customerPhone: string | null;
  guestCount: number;

  startAt: string;
  endAt: string;

  status: ReservationStatus;
  notes: string | null;

  createdAt: string;
  updatedAt: string;

  table: ReservationTable | null;
};

export type CreateReservationPayload = {
  customerName: string;
  customerPhone?: string;
  guestCount: number;
  startAt: string;
  endAt: string;
  tableId?: string;
  notes?: string;
};

export type UpdateReservationPayload = {
  customerName?: string;
  customerPhone?: string;
  guestCount?: number;
  startAt?: string;
  endAt?: string;
  tableId?: string;
  notes?: string;
};
