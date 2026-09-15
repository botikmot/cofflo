"use client";

import type { PublicMenuProduct } from "@/types/menu";

type ProductCardProps = {
  product: PublicMenuProduct;
  currency: string;
  onAdd: (product: PublicMenuProduct) => void;
};

export function ProductCard({ product, currency, onAdd }: ProductCardProps) {
  const price = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
  }).format(Number(product.price));

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold">{product.name}</h3>

          {product.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {product.description}
            </p>
          )}

          <p className="mt-3 font-medium">{price}</p>
        </div>

        <button
          type="button"
          onClick={() => onAdd(product)}
          className="shrink-0 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Add
        </button>
      </div>
    </div>
  );
}
