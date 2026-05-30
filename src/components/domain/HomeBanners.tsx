import { colors } from "@/constants/theme";
import { useHomeBanners } from "@/hooks/useHomeBanners";
import { Banner } from "@/types/schema.types"; // التعديل هنا
import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 32;

export const HomeBanners = () => {
  const { banners, isLoading, isError, handleAction } = useHomeBanners();
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index || 0);
    },
    [],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  if (isError || (!isLoading && banners.length === 0)) return null;

  if (isLoading) {
    return (
      <View
        className="bg-background py-4 justify-center items-center"
        style={{
          width: BANNER_WIDTH,
          aspectRatio: 21 / 9,
          marginHorizontal: 16,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary.default} />
      </View>
    );
  }

  const renderBanner = (
    { item }: { item: Banner }, // التعديل هنا
  ) => (
    <View
      className="items-center justify-center px-4 pt-2 pb-1"
      style={{ width: BANNER_WIDTH + 32 }}
    >
      <TouchableOpacity
        onPress={() => handleAction(item)}
        activeOpacity={0.85}
        className="w-full shadow-sm"
      >
        <Image
          source={{ uri: item.image_url }}
          style={{ width: "100%", aspectRatio: 21 / 9, borderRadius: 16 }}
          contentFit="cover"
          transition={300}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="bg-background pt-2 pb-4 items-center">
      <View className="overflow-hidden" style={{ width: width }}>
        <FlatList
          data={banners}
          renderItem={renderBanner}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          bounces={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>

      {banners.length > 1 && (
        <View className="flex-row justify-center items-center mt-2 gap-x-2.5">
          {banners.map((_, index) => (
            <View
              key={`dot-${index}`}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: activeIndex === index ? 16 : 6,
                backgroundColor:
                  activeIndex === index
                    ? colors.primary.default
                    : colors.gray[300],
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};
