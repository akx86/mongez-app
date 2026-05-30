import { colors } from "@/constants/theme";
import { useHomeHeader } from "@/hooks/useHomeHeader";
import { ChevronDown, MapPin } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export const HomeHeader = () => {
  const { userName, locationLabel, isLoadingLocation, onLocationPress } =
    useHomeHeader();

  return (
    // الخلفية من الثيم: background (#F5F5F5)
    <View className="flex-row justify-between items-center px-4 pt-4 pb-2 bg-background">
      {/* القسم الأول (اليمين في الـ RTL): زر اللوكيشن */}
      <View className="flex-1 items-start justify-center pr-4">
        <Text className="text-text-muted font-semibold text-xl mb-1">
          التوصيل إلى
        </Text>

        <TouchableOpacity
          onPress={onLocationPress}
          activeOpacity={0.7}
          // استخدام gap-1 لفصل العناصر بروفيشنال بدل الـ margins العشوائية
          className="flex-row items-center gap-x-1"
        >
          <MapPin size={18} color={colors.primary.default} />

          {isLoadingLocation ? (
            <ActivityIndicator
              size="small"
              color={colors.primary.default}
              className="mx-2"
            />
          ) : (
            // numberOfLines={1} لضمان عدم تشوه الواجهة إذا كان اسم المنطقة طويلاً جداً
            <Text
              className="text-text-main font-bold text-base"
              numberOfLines={1}
              style={{ flexShrink: 1 }} // لمنع النص من دفع الأيقونات خارج الشاشة
            >
              {locationLabel}
            </Text>
          )}

          <ChevronDown size={18} color={colors.text.main} />
        </TouchableOpacity>
      </View>

      {/* القسم الثاني (اليسار في الـ RTL): رسالة الترحيب */}
      {/* استخدمنا الـ Surface (#FFFFFF) كخلفية بسيطة لتمييز اسم المستخدم */}
      <View className="items-end px-4 py-2 rounded-xl ">
        <Text className="text-text-muted font-semibold text-xl">
          أهلاً بك 👋
        </Text>
        <Text className="text-primary-dark font-bold text-xl mt-0.5">
          {userName}
        </Text>
      </View>
    </View>
  );
};
