import { User } from "@/types/schema.types";
import { create } from "zustand";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean; // ← مهم: عرفنا حالة الـ auth ولا لسه؟
  setUser: (user: User | null) => void;
  setLoading: (v: boolean) => void;
  setHydrated: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  isHydrated: false,

  setUser: (user) => set({ user }),
  setLoading: (v) => set({ isLoading: v }),
  setHydrated: (v) => set({ isHydrated: v }),
  logout: () => set({ user: null }),
}));
