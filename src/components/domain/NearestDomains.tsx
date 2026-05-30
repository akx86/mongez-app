import { colors } from "@/constants/theme";
import { useNearestDomains } from "@/hooks/useNearestDomains";
import { Image } from "expo-image";
import { ChevronLeft } from "lucide-react-native"; // أيقونة سهم صغير لزرار "تسوق الآن"
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
// الحسبة دي بتخلي عرض الكارت ياخد أقل من نص الشاشة بشوية (عشان يظهر كارتين وقطعة من التالت)
const CARD_WIDTH = width * 0.42;

export const NearestDomains = () => {
  const { domains, isLoading, isError, handleDomainPress } =
    useNearestDomains();

  if (isError || (!isLoading && domains.length === 0)) return null;

  if (isLoading) {
    return (
      <View
        className="py-8 justify-center items-center"
        style={{ minHeight: 120 }}
      >
        <ActivityIndicator size="large" color={colors.primary.default} />
      </View>
    );
  }

  return (
    <View className="bg-background pt-4 pb-8">
      {/* هيدر السكشن */}
      <View className="flex-row justify-between items-center px-4 mb-4">
        <TouchableOpacity activeOpacity={0.7}>
          <Text className="text-primary font-medium text-sm">عرض المزيد</Text>
        </TouchableOpacity>
        <Text className="text-text-main font-bold text-lg text-right">
          الأقرب إليك
        </Text>
      </View>

      {/* شريط السكرول */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 12,
          flexDirection: "row-reverse",
        }}
      >
        {domains.map((domain) => (
          <TouchableOpacity
            key={domain.id}
            onPress={() => handleDomainPress(domain)}
            activeOpacity={0.8}
            className="bg-surface rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex-row-reverse items-center p-2"
            style={{ width: CARD_WIDTH, height: 80 }} // كارت مستطيل صغير
          >
            {/* 1. الصورة على اليمين (flex-row-reverse بتخليها يمين) */}
            <View className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
              <Image
                source={{ uri: domain.icon_url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={200}
              />
            </View>

            {/* 2. المحتوى على الشمال */}
            <View className="flex-1 mr-3 justify-center">
              <Text
                className="text-text-main font-bold text-sm text-right mb-1"
                numberOfLines={1}
              >
                {domain.name}
              </Text>

              <View className="flex-row justify-end items-center gap-x-1">
                <ChevronLeft size={14} color={colors.primary.default} />
                <Text className="text-primary font-medium text-xs text-right">
                  تسوق الآن
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
