import { useAuthStore } from "@/store/auth.store";
import { useLocationStore } from "@/store/location.store";
import { useEffect } from "react";

export const useHomeHeader = () => {
  const { user } = useAuthStore();
  const { addressLabel, fetchCurrentLocation, isLoading } = useLocationStore();

  useEffect(() => {
    // استدعاء جلب الموقع مرة واحدة فقط عند تحميل الشاشة (Mount)
    fetchCurrentLocation();
  }, [fetchCurrentLocation]);

  // استخراج الاسم الأول فقط من full_name، أو "زائر" إذا كان Guest
  const firstName = user?.full_name ? user.full_name.split(" ")[0] : "زائر";

  // تحديد النص الذي سيظهر للوكيشن
  const locationText = addressLabel || "تحديد الموقع...";

  const handleLocationPress = () => {
    // سيتم استبدال هذا لاحقاً بفتح الـ Bottom Sheet أو شاشة الخرائط
    console.log("فتح شاشة تغيير الموقع...");
  };

  return {
    userName: firstName,
    locationLabel: locationText,
    isLoadingLocation: isLoading,
    onLocationPress: handleLocationPress,
  };
};
