export type PublicMenuProduct = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  };
};

export type PublicMenuCategory = {
  id: string;
  name: string;
  products: PublicMenuProduct[];
};

export type PublicMenuResponse = {
  branch: {
    id: string;
    name: string;
    slug: string;
  };
  organization: {
    id: string;
    name: string;
    tagline: string;
    slug: string;
    currency: string;
  };
  categories: PublicMenuCategory[];
};
