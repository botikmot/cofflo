import { apiFetch } from "@/lib/api";

export type ProductStatus = "ACTIVE" | "ARCHIVED";

export type ProductCategory = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
};

export type Product = {
  id: string;
  organizationId: string;
  categoryId: string | null;

  name: string;
  description: string | null;
  sku: string | null;
  imageUrl: string | null;

  price: string;
  cost: string | null;

  status: ProductStatus;

  createdAt: string;
  updatedAt: string;

  category: ProductCategory | null;
};

export type CreateProductPayload = {
  name: string;
  description?: string;
  sku?: string;
  imageUrl?: string;
  price: number;
  cost?: number;
  categoryId?: string;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export const productService = {
  getProducts(organizationId: string) {
    return apiFetch<Product[]>(`/organizations/${organizationId}/products`);
  },

  createProduct(organizationId: string, payload: CreateProductPayload) {
    return apiFetch<Product>(`/organizations/${organizationId}/products`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateProduct(
    organizationId: string,
    productId: string,
    payload: UpdateProductPayload,
  ) {
    return apiFetch<Product>(
      `/organizations/${organizationId}/products/${productId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  },

  archiveProduct(organizationId: string, productId: string) {
    return apiFetch<Product>(
      `/organizations/${organizationId}/products/${productId}`,
      {
        method: "DELETE",
      },
    );
  },
};
