"use client";

import { usePublicMenu } from "@/hooks/orders/use-public-menu";

import type { PublicMenuProduct } from "@/types/menu";

import { ProductCard } from "./product-card";

type PublicMenuProps = {
  branchId: string;
  onAdd: (product: PublicMenuProduct) => void;
};

export function PublicMenu({ branchId, onAdd }: PublicMenuProps) {
  const { data, isLoading, isError } = usePublicMenu(branchId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-20 animate-pulse rounded-2xl bg-muted" />
        <div className="h-20 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border p-5">
        <p className="text-sm text-destructive">Unable to load the menu.</p>
      </div>
    );
  }

  if (data.categories.every((category) => category.products.length === 0)) {
    return (
      <div className="rounded-2xl border p-5 text-center">
        <p className="font-medium">No products available</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {data.categories.map((category) => (
        <section key={category.id} className="space-y-3">
          <div>
            <h2 className="text-xl font-bold">{category.name}</h2>

            <p className="text-sm text-muted-foreground">
              {category.products.length}{" "}
              {category.products.length === 1 ? "item" : "items"}
            </p>
          </div>

          <div className="space-y-3">
            {category.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={data.organization.currency}
                onAdd={onAdd}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
