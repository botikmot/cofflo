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
      <div className="space-y-8">
        {[1, 2].map((section) => (
          <section key={section} className="space-y-4">
            <div className="space-y-2">
              <div className="h-5 w-28 animate-pulse rounded-lg bg-[#EEE6DC]" />
              <div className="h-3 w-16 animate-pulse rounded-lg bg-[#F3ECE4]" />
            </div>

            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border border-[#EDE4D8] bg-white"
                >
                  <div className="aspect-[4/3] animate-pulse bg-[#F3ECE4]" />

                  <div className="space-y-3 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-[#EEE6DC]" />
                    <div className="h-3 w-full animate-pulse rounded bg-[#F3ECE4]" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-[#F3ECE4]" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-[#E7C9C1] bg-[#FCF1EE] p-6 text-center">
        <p className="text-sm font-medium text-[#9B5B4D]">
          Unable to load the menu.
        </p>
      </div>
    );
  }

  const categoriesWithProducts = data.categories.filter(
    (category) => category.products.length > 0,
  );

  if (categoriesWithProducts.length === 0) {
    return (
      <div className="rounded-3xl border border-[#EDE4D8] bg-white p-8 text-center">
        <p className="font-semibold text-[#2B2118]">No products available</p>

        <p className="mt-1 text-sm text-[#8A7866]">Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categoriesWithProducts.map((category) => (
        <section key={category.id} className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#2B2118] sm:text-xl">
                {category.name}
              </h2>

              <p className="mt-1 text-xs text-[#8A7866]">
                {category.products.length}{" "}
                {category.products.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
