import { Item } from "@/types/schema.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartStore {
  items: Item[];
  vendorId: string | null;
  addItem: (vendorId: string, item: Omit<Item, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      vendorId: null,

      addItem: (vendorId, item) =>
        set((state) => {
          const resolvedVendorId = state.vendorId ?? vendorId;
          const found = state.items.find((i) => i.id === item.id);

          if (found) {
            return {
              vendorId: resolvedVendorId,
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }

          return {
            vendorId: resolvedVendorId,
            items: [...state.items, { ...item, quantity: 1 }],
          };
        }),

      removeItem: (id) =>
        set((state) => {
          const items = state.items.filter((i) => i.id !== id);
          return {
            items,
            vendorId: items.length === 0 ? null : state.vendorId,
          };
        }),

      updateQty: (id, qty) =>
        set((state) => {
          if (qty <= 0) {
            const items = state.items.filter((i) => i.id !== id);
            return {
              items,
              vendorId: items.length === 0 ? null : state.vendorId,
            };
          }

          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: qty } : i,
            ),
            vendorId: state.vendorId,
          };
        }),

      clearCart: () => set({ items: [], vendorId: null }),

      total: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
