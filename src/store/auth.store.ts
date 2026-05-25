import { auth } from "@/services/firebase";
import { Customer } from "@/types/schema.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthStore {
  user: Customer | null;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: Customer | null) => void;
  setLoading: (v: boolean) => void;
  setHydrated: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isHydrated: false,

      setUser: (user) => set({ user }),
      setLoading: (v) => set({ isLoading: v }),
      setHydrated: (v) => set({ isHydrated: v }),
      logout: async () => {
        try {
          await signOut(auth);

          set({ user: null });
        } catch (error) {
          console.error("Error signing out from Firebase:", error);
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({ user: state.user }),
    },
  ),
);
