import { auth } from "@/services/firebase";
import { Customer } from "@/types/schema.types";
import { signOut } from "firebase/auth";
import { create } from "zustand";

interface AuthStore {
  user: Customer | null;
  isLoading: boolean;
  isHydrated: boolean; // ← مهم: عرفنا حالة الـ auth ولا لسه؟
  setUser: (user: Customer | null) => void;
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
  logout: async () => {
    try {
      // 1. تدمير الجلسة من فايربيز ومسح التوكن من الجهاز
      await signOut(auth);

      // 2. تصفير البيانات المحلية في الرامات
      set({ user: null });
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
      throw error; // بنرمي الإيرور عشان لو الشاشة حابة تظهر رسالة خطأ
    }
  },
}));
