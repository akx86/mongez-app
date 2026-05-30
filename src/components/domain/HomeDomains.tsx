import { colors } from "@/constants/theme";
import { useHomeCategories } from "@/hooks/useHomeCategories";
import { Image } from "expo-image";
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
const ITEM_WIDTH = width / 4.5;

export const HomeDomains = () => {
  const {
    domains: domains,
    isLoading,
    isError,
    handleDomainPress,
  } = useHomeCategories();

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
    <View className="bg-background pt-2 pb-6">
      <View className="px-4 mb-4">
        <Text className="text-text-main font-bold text-lg text-right">
          بتدور على إيه؟
        </Text>
      </View>

      {/* استبدلنا الـ View بـ ScrollView أفقي */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // flexDirection: 'row-reverse' عشان السكرول يبدأ من اليمين للشمال (RTL)
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
            activeOpacity={0.7}
            className="items-center"
            style={{ width: ITEM_WIDTH }}
          >
            {/* - w-full: هياخد العرض اللي حددناه فوق
              - aspect-square: هيجبر الارتفاع يكون قد العرض بالظبط (مربع مثالي)
              - rounded-2xl: البوردر ريديس اللي طلبته
            */}
            <View className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm mb-2 bg-gray-100 border border-gray-100">
              <Image
                source={{ uri: domain.icon_url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover" // عشان الصورة الحقيقية تملى المربع
                transition={200}
              />
            </View>

            <Text
              className="text-text-main font-medium text-xs text-center px-1"
              numberOfLines={1}
            >
              {domain.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
