// app/_layout.tsx
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
import { Stack, useRouter, useSegments } from "expo-router";
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

  const { user, isHydrated, setUser, setHydrated } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const customerProfile = await getCurrentCustomer();
          setUser(customerProfile);
        } catch (error) {
          console.log("Customer profile missing, setting user to null.");
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setHydrated(true);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isHydrated || !fontsLoaded) return;

    const inProfileSetupGroup = segments[0] === "profile-setup";
    const hasFirebaseSession = auth.currentUser !== null;

    if (hasFirebaseSession && !user && !inProfileSetupGroup) {
      router.replace("/profile-setup");
    }

    SplashScreen.hideAsync();
  }, [user, isHydrated, segments, fontsLoaded]);

  if (!fontsLoaded) return null;

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
