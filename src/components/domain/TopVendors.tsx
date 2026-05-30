import { colors } from "@/constants/theme";
import { useTopVendors } from "@/hooks/useTopVendors";
import { Image } from "expo-image";
import { Star } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TopVendorsProps {
  domainId?: string;
}

export const TopVendors = ({ domainId }: TopVendorsProps) => {
  const { vendors, isLoading, isError, handleVendorPress } =
    useTopVendors(domainId);

  if (isError || (!isLoading && vendors.length === 0)) return null;

  if (isLoading) {
    return (
      <View
        className="py-8 justify-center items-center"
        style={{ minHeight: 160 }}
      >
        <ActivityIndicator size="large" color={colors.primary.default} />
      </View>
    );
  }

  return (
    <View className="bg-background pt-4 pb-6">
      {/* الهيدر */}
      <View className="flex-row justify-between items-center px-4 mb-3">
        <TouchableOpacity activeOpacity={0.7}>
          <Text className="text-primary font-medium text-sm">عرض الكل</Text>
        </TouchableOpacity>
        <Text className="text-text-main font-bold text-lg text-right">
          الأعلى تقييماً
        </Text>
      </View>

      {/* شريط السكرول */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 16,
          flexDirection: "row-reverse",
        }}
      >
        {vendors.map((vendor) => (
          <TouchableOpacity
            key={vendor.id}
            onPress={() => handleVendorPress(vendor)}
            activeOpacity={0.8}
            style={{ width: 160 }} // عرض المستطيل (متوسط ومناسب جداً)
          >
            {/* 1. المستطيل بتاع الصورة (بدون أي حواف كارت) */}
            <View className="w-full h-28 rounded-xl overflow-hidden relative bg-gray-100">
              <Image
                // بنستخدم cover_url ولو مش موجود بنجيب الـ logo_url كبديل
                source={{ uri: vendor.cover_url || vendor.logo_url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover" // عشان الصورة الحقيقية تملى المساحة
                transition={200}
              />

              {/* 2. التقييم: فوق الصورة، من تحت، على الشمال (absolute bottom-2 left-2) */}
              <View className="absolute bottom-2 left-2 bg-white/95 rounded-lg px-2 py-1 flex-row items-center gap-x-1 shadow-sm">
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-text-main font-bold text-xs mt-0.5">
                  {vendor.rating?.toFixed(1) || "جديد"}
                </Text>
              </View>
            </View>

            {/* 3. اسم المطعم: تحت الصورة مباشرة */}
            <Text
              className="text-text-main font-bold text-base text-right mt-2 px-1"
              numberOfLines={1}
            >
              {vendor.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
