import { useReverseGeocode } from "@/api/maps/queries";
import { useUpdateAddressMutation } from "@/api/customers/mutations";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { colors } from "@/constants/theme";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/store/auth.store";
import { useLocationStore } from "@/store/location.store";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const DEFAULT_COORDS = {
  latitude: 30.0444,
  longitude: 31.2357,
};

const DEFAULT_REGION: Region = {
  ...DEFAULT_COORDS,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const PIN_SIZE = 40;

export default function LocationPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const user = useAuthStore((state) => state.user);
  const setLocation = useLocationStore((state) => state.setLocation);
  const { latitude: savedLat, longitude: savedLng } = useLocationStore();

  const updateAddressMutation = useUpdateAddressMutation();

  const [building, setBuilding] = useState(user?.address_details?.building ?? "");
  const [floor, setFloor] = useState(user?.address_details?.floor ?? "");
  const [apartment, setApartment] = useState(
    user?.address_details?.apartment ?? "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const [coords, setCoords] = useState({
    lat: savedLat ?? DEFAULT_COORDS.latitude,
    lng: savedLng ?? DEFAULT_COORDS.longitude,
  });

  const debouncedLat = useDebounce(coords.lat, 500);
  const debouncedLng = useDebounce(coords.lng, 500);

  const {
    data: geocodeData,
    isLoading: isGeocoding,
    isError: isGeocodeError,
  } = useReverseGeocode(debouncedLat, debouncedLng);

  useEffect(() => {
    const initMapLocation = async () => {
      if (savedLat !== null && savedLng !== null) {
        const savedRegion: Region = {
          latitude: savedLat,
          longitude: savedLng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setCoords({ lat: savedLat, lng: savedLng });
        mapRef.current?.animateToRegion(savedRegion, 400);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "صلاحية الموقع",
          "لم يتم منح صلاحية الموقع. تم عرض موقع افتراضي ويمكنك تحريك الخريطة لاختيار عنوانك.",
        );
        return;
      }

      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const nextRegion: Region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        mapRef.current?.animateToRegion(nextRegion, 500);
      } catch {
        Alert.alert(
          "تعذّر تحديد الموقع",
          "تعذّر الوصول لموقعك الحالي. تم استخدام موقع افتراضي ويمكنك تحريك الخريطة.",
        );
      }
    };

    if (isMapReady) {
      void initMapLocation();
    }
  }, [isMapReady, savedLat, savedLng]);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    setCoords({ lat: region.latitude, lng: region.longitude });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!building.trim()) {
      Alert.alert("حقل مطلوب", "يرجى إدخال رقم المبنى.");
      return;
    }

    if (!geocodeData) {
      Alert.alert("خطأ", "تعذّر تحديد العنوان. حرّك الخريطة وحاول مرة أخرى.");
      return;
    }

    const addressLabel =
      geocodeData.full_address ||
      [geocodeData.street, geocodeData.city].filter(Boolean).join("، ") ||
      "موقع محدد";

    try {
      setIsSubmitting(true);

      setLocation({
        latitude: coords.lat,
        longitude: coords.lng,
        addressLabel,
      });

      if (user) {
        await updateAddressMutation.mutateAsync({
          city: geocodeData.city,
          street: geocodeData.street,
          building: building.trim(),
          floor: floor.trim() || undefined,
          apartment: apartment.trim() || undefined,
          coordinates: { lat: coords.lat, lng: coords.lng },
        });
      }

      router.back();
    } catch {
      Alert.alert("خطأ", "تعذّر حفظ الموقع. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    building,
    floor,
    apartment,
    geocodeData,
    coords.lat,
    coords.lng,
    setLocation,
    user,
    updateAddressMutation,
    router,
  ]);

  return (
    <View className="flex-1 bg-background">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={DEFAULT_REGION}
        onMapReady={() => setIsMapReady(true)}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
      />

      <View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center"
        style={{ marginBottom: PIN_SIZE / 2 }}
      >
        <Ionicons
          name="location-sharp"
          size={PIN_SIZE}
          color={colors.primary.default}
        />
      </View>

      <SafeAreaView
        edges={["top"]}
        className="absolute top-0 right-0 left-0"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          className="m-4 w-10 h-10 rounded-full items-center justify-center self-end border border-gray-100"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.text.main} />
        </TouchableOpacity>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="absolute left-0 right-0 bottom-0"
      >
        <View
          className="rounded-t-3xl border-t border-gray-100 px-4 pt-5"
          style={{
            backgroundColor: colors.surface,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <Text className="text-text-main font-bold text-lg text-right mb-3">
            تأكيد عنوان التوصيل
          </Text>

          {isGeocoding ? (
            <View className="mb-4 gap-y-2">
              <Skeleton width="70%" height={18} borderRadius={6} />
              <Skeleton width="50%" height={16} borderRadius={6} />
            </View>
          ) : isGeocodeError ? (
            <Text
              className="text-right text-sm mb-4"
              style={{ color: colors.error }}
            >
              تعذّر جلب العنوان. حرّك الخريطة وحاول مرة أخرى.
            </Text>
          ) : (
            <View className="mb-4">
              <Text className="text-text-main font-bold text-base text-right">
                {geocodeData?.city || "—"}
              </Text>
              <Text className="text-text-muted text-sm text-right mt-1">
                {geocodeData?.street || geocodeData?.full_address || "—"}
              </Text>
            </View>
          )}

          <Input
            label="رقم المبنى *"
            placeholder="مثال: 12"
            value={building}
            onChangeText={setBuilding}
            className="mb-3"
          />
          <Input
            label="الدور (اختياري)"
            placeholder="مثال: 4"
            value={floor}
            onChangeText={setFloor}
            className="mb-3"
          />
          <Input
            label="الشقة (اختياري)"
            placeholder="مثال: 8"
            value={apartment}
            onChangeText={setApartment}
            className="mb-4"
          />

          <TouchableOpacity
            onPress={() => void handleConfirm()}
            activeOpacity={0.9}
            disabled={isSubmitting || isGeocoding}
            className="py-4 rounded-xl items-center justify-center"
            style={{
              backgroundColor: colors.primary.default,
              opacity: isSubmitting || isGeocoding ? 0.7 : 1,
            }}
          >
            <Text
              className="font-bold text-base"
              style={{ color: colors.text.inverse }}
            >
              {isSubmitting ? "جاري الحفظ..." : "تأكيد الموقع"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
