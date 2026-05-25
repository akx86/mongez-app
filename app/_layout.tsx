// app/_layout.tsx
import { setupAxiosInterceptors } from "@/api/client";
import { getCurrentCustomer } from "@/api/customers/queries";
import { queryClient } from "@api/queryClient";
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  useFonts,
} from "@expo-google-fonts/tajawal";
import { auth } from "@services/firebase";
import { useAuthStore } from "@store/auth.store";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });

  const { user, isHydrated, setUser, setHydrated, logout } = useAuthStore();

  useEffect(() => {
    setupAxiosInterceptors(logout);
  }, [logout]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setHydrated(true);
      if (firebaseUser) {
        getCurrentCustomer()
          .then((customerProfile) => {
            setUser(customerProfile);
          })
          .catch((error) => {
            console.log("Customer profile missing or network error.");
          });
      } else {
        setUser(null);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isHydrated || !fontsLoaded) return;
    SplashScreen.hideAsync();
  }, [user, isHydrated, fontsLoaded]);

  if (!fontsLoaded || !isHydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
