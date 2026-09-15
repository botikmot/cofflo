"use client";

import { useQuery } from "@tanstack/react-query";

import { productCategoryService } from "@/services/product-categories.service";

export function useProductCategories(organizationId?: string) {
  return useQuery({
    queryKey: ["product-categories", organizationId],

    queryFn: () => productCategoryService.getCategories(organizationId!),

    enabled: Boolean(organizationId),

    staleTime: 30_000,
  });
}
