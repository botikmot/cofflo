"use client";

import { useQuery } from "@tanstack/react-query";

import { productService } from "@/services/products.service";

export function useProducts(organizationId?: string) {
  return useQuery({
    queryKey: ["products", organizationId],

    queryFn: () => productService.getProducts(organizationId!),

    enabled: Boolean(organizationId),

    staleTime: 30_000,
  });
}
