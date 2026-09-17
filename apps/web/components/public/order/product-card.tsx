"use client";

import { Plus } from "lucide-react";

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
    <article className="group overflow-hidden rounded-3xl border border-[#EDE4D8] bg-white shadow-[0_4px_18px_rgba(43,33,24,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(43,33,24,0.08)]">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F3ECE4]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8D9CA] text-2xl">
              ☕
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#2B2118] sm:text-[15px]">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#8A7866]">
            {product.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-base font-black text-[#6F4E37]">{price}</p>

          <button
            type="button"
            onClick={() => onAdd(product)}
            aria-label={`Add ${product.name}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6F4E37] text-white shadow-sm transition hover:bg-[#5D402E] active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  );
}
