export type PublicBranchResponse = {
  branch: {
    id: string;
    name: string;
    slug: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    currency: string;
  };
};

export type PublicTable = {
  id: string;
  name: string;
  capacity: number;
  location: string | null;
  photoUrl: string | null;
  customerSelectable: boolean;
  status: string;
};

export type PublicTableQrResponse = {
  table: PublicTable;
  branch: {
    id: string;
    name: string;
    slug: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    currency: string;
  };
};
