import { apiFetch } from "@/lib/api";

import type { ProductCategory } from "./products.service";

export type CreateProductCategoryPayload = {
  name: string;
  description?: string;
  sortOrder?: number;
};

export type UpdateProductCategoryPayload =
  Partial<CreateProductCategoryPayload>;

export const productCategoryService = {
  getCategories(organizationId: string) {
    return apiFetch<ProductCategory[]>(
      `/organizations/${organizationId}/product-categories`,
    );
  },

  createCategory(
    organizationId: string,
    payload: CreateProductCategoryPayload,
  ) {
    return apiFetch<ProductCategory>(
      `/organizations/${organizationId}/product-categories`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  updateCategory(
    organizationId: string,
    categoryId: string,
    payload: UpdateProductCategoryPayload,
  ) {
    return apiFetch<ProductCategory>(
      `/organizations/${organizationId}/product-categories/${categoryId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  },

  archiveCategory(organizationId: string, categoryId: string) {
    return apiFetch<ProductCategory>(
      `/organizations/${organizationId}/product-categories/${categoryId}`,
      {
        method: "DELETE",
      },
    );
  },
};
