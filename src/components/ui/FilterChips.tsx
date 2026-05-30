import { colors } from "@/constants/theme";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const FILTERS = ["الكل", "أحدث المطاعم", "عروض", "توصيل مجاني", "شوبر"];

export const FilterChips = () => {
  const [activeFilter, setActiveFilter] = useState("الكل");

  return (
    <View className="my-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {FILTERS.map((filter, index) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => setActiveFilter(filter)}
              style={{
                backgroundColor: isActive
                  ? colors.primary.default
                  : colors.surface,
                borderColor: isActive
                  ? colors.primary.default
                  : colors.gray[200],
                borderWidth: 1,
              }}
              className="px-4 py-1.5 rounded-full ml-2"
            >
              <Text
                style={{ color: isActive ? colors.surface : colors.text.main }}
                className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
