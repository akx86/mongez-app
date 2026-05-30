import * as Location from "expo-location";
import { create } from "zustand";

// 1. تعريف واجهة البيانات
export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  addressLabel: string | null;
  isLoading: boolean;
  error: string | null;

  setLocation: (params: {
    latitude: number;
    longitude: number;
    addressLabel: string;
  }) => void;
  fetchCurrentLocation: () => Promise<void>;
}

// 2. إنشاء الستور
export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  addressLabel: null,
  isLoading: false,
  error: null,

  setLocation: ({ latitude, longitude, addressLabel }) =>
    set({
      latitude,
      longitude,
      addressLabel,
      isLoading: false,
      error: null,
    }),

  // 3. منطق جلب الموقع
  fetchCurrentLocation: async () => {
    // إبلاغ الواجهة ببدء التحميل وتصفير أي خطأ سابق
    set({ isLoading: true, error: null });

    try {
      // أ. طلب الصلاحيات
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        set({
          isLoading: false,
          error:
            "تم رفض صلاحية الوصول للموقع. التطبيق يحتاج الموقع لعرض الأقرب لك.",
        });
        return; // بنوقف التنفيذ هنا لو رفض
      }

      // ب. جلب الإحداثيات
      // استخدمنا دقة Balanced عشان منستهلكش بطارية كتير واحنا لسه في الهوم سكرين
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // ج. تحويل الإحداثيات لعنوان مقروء
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let finalAddressLabel = "موقع غير معروف";

      // التأكد إن فيه نتيجة رجعت من إكسبو
      if (geocode.length > 0) {
        const place = geocode[0];

        // تجميع العنوان بشكل مناسب لمصر (المنطقة/المدينة، المحافظة)
        // city ساعات بترجع فاضية في بعض الأماكن في مصر، فبنعمل Fallback للـ subregion
        const area =
          place.city || place.subregion || place.district || place.name;
        const governorate = place.region;

        if (area && governorate) {
          finalAddressLabel = `${area}، ${governorate}`;
        } else if (area || governorate) {
          finalAddressLabel = area || governorate || finalAddressLabel;
        }
      }

      // د. حفظ البيانات النهائية في الستور
      set({
        latitude,
        longitude,
        addressLabel: finalAddressLabel,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // هـ. اصطياد الأخطاء الخارجة عن الإرادة (زي إن الـ GPS نفسه مقفول من إعدادات الموبايل)
      set({
        isLoading: false,
        error: error.message || "حدث خطأ أثناء الاتصال بخدمة تحديد الموقع.",
      });
    }
  },
}));
