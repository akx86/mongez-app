import { Item } from "@/types/schema.types"; // تأكد إن OrderItem جواها id
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartStore {
  items: Item[];
  addItem: (item: Omit<Item, "quantity">) => void;
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

      // 1. إضافة منتج
      addItem: (item) =>
        set((state) => {
          // بندور هل المنتج ده موجود أصلاً في السلة؟
          const found = state.items.find((i) => i.id === item.id);

          return found
            ? {
                // لو موجود: بنلف على المنتجات، ولما نلاقيه بنزود الكمية +1 (Immutability)
                items: state.items.map((i) =>
                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
                ),
              }
            : {
                // لو مش موجود: بنضيفه في الآخر وبنديله كمية مبدئية 1
                items: [...state.items, { ...item, quantity: 1 }],
              };
        }),

      // 2. مسح منتج بالكامل
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      // 3. تعديل الكمية مباشرة (+ أو -)
      updateQty: (id, qty) =>
        set((state) => {
          // حماية منطقية: لو العميل قلل الكمية لصفر أو أقل، امسح المنتج من السلة
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          // غير كده، عدل الكمية للرقم الجديد
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: qty } : i,
            ),
          };
        }),

      // 4. تفريغ السلة (بعد الدفع مثلاً)
      clearCart: () => set({ items: [] }),

      // 5. حساب الإجمالي المادي
      total: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      // 6. حساب إجمالي عدد القطع
      count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
