import { useAuthStore } from "@/store/auth.store";
import { useLocationStore } from "@/store/location.store";
import { useRouter } from "expo-router";
import { useMemo } from "react";

export const useHomeHeader = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addressLabel, isLoading } = useLocationStore();

  const firstName = user?.full_name ? user.full_name.split(" ")[0] : "زائر";

  const locationLabel = useMemo(() => {
    if (addressLabel?.trim()) {
      return addressLabel;
    }

    const savedAddress = user?.address_details;
    if (savedAddress?.street?.trim()) {
      return savedAddress.street;
    }
    if (savedAddress?.city?.trim()) {
      return savedAddress.city;
    }

    return "اختر موقع التوصيل";
  }, [addressLabel, user?.address_details]);

  const handleLocationPress = () => {
    router.push("/(main)/location-picker");
  };

  return {
    userName: firstName,
    locationLabel,
    isLoadingLocation: isLoading,
    onLocationPress: handleLocationPress,
  };
};
