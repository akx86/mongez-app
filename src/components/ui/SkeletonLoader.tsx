// src/components/ui/SkeletonLoader.tsx
import { colors } from "@/constants/theme";
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

interface SkeletonProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  className?: string;
}

export const Skeleton = ({
  width,
  height,
  borderRadius = 12,
  className = "",
}: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: colors.gray[200],
        opacity,
      }}
      className={className}
    />
  );
};

export const CategorySkeleton = () => (
  <View className="items-center mx-3">
    <Skeleton width={64} height={64} borderRadius={32} />
    <Skeleton width={50} height={12} borderRadius={4} className="mt-2" />
  </View>
);

export const VendorCardSkeleton = () => (
  <View
    style={{ backgroundColor: colors.surface }}
    className="w-64 mx-3 rounded-2xl overflow-hidden p-3 border border-gray-100"
  >
    <Skeleton width="100%" height={120} borderRadius={12} />
    <Skeleton width="70%" height={16} borderRadius={4} className="mt-3" />
    <Skeleton width="40%" height={12} borderRadius={4} className="mt-2" />
    <View className="flex-row items-center justify-between mt-3">
      <Skeleton width={50} height={12} borderRadius={4} />
      <Skeleton width={60} height={12} borderRadius={4} />
    </View>
  </View>
);
