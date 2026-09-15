import { create } from "zustand";

import type { PublicMenuProduct } from "@/types/menu";

export type CartItem = {
  product: PublicMenuProduct;
  quantity: number;
};

type CartState = {
  items: CartItem[];

  addItem: (product: PublicMenuProduct) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find(
        (item) => item.product.id === product.id,
      );

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            product,
            quantity: 1,
          },
        ],
      };
    }),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((item) => item.product.id !== productId)
          : state.items.map((item) =>
              item.product.id === productId
                ? {
                    ...item,
                    quantity,
                  }
                : item,
            ),
    })),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    })),

  clearCart: () =>
    set({
      items: [],
    }),
}));
