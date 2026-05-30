import { useHomeFilters } from "@/hooks/useHomeFilters";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
export const HomeFilters = () => {
  const { filters, activeId, handleSelect } = useHomeFilters();

  return (
    <View className="bg-background py-2 ">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 4,
          flexDirection: "row-reverse",
        }}
      >
        {filters.map((filter) => {
          const isActive = activeId === filter.id;

          return (
            <TouchableOpacity
              key={filter.id}
              onPress={() => handleSelect(filter)}
              activeOpacity={0.7}
              className={`px-5 py-2 rounded-full border ${
                isActive
                  ? "bg-primary border-primary"
                  : "bg-surface border-gray-200"
              }`}
            >
              <Text className={`font-semibold text-xs  text-black${isActive}`}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
