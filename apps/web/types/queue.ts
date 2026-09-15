export type QueueStatus =
  | "WAITING"
  | "CALLED"
  | "SEATED"
  | "CANCELLED"
  | "NO_SHOW";

export type JoinPublicQueuePayload = {
  customerName: string;
  customerPhone?: string;
  guestCount: number;
  notes?: string;
};

export type PublicQueue = {
  publicToken: string;
  queueNumber: number;
  customerName: string;
  guestCount: number;
  status: QueueStatus;
  joinedAt: string;
  calledAt: string | null;
  seatedAt: string | null;
  position: number | null;
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

export type JoinQueueResponse = {
  publicToken: string;
  queueNumber: number;
  customerName: string;
  guestCount: number;
  status: QueueStatus;
  joinedAt: string;
  branch: {
    id: string;
    name: string;
  };
};
