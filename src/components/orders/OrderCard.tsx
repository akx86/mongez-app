import { colors } from "@/constants/theme";
import { Order } from "@/types/schema.types";
import {
  formatOrderDate,
  formatOrderId,
  getOrderStatusColors,
  getOrderStatusLabel,
} from "@/utils/orderStatus";
import { formatPrice } from "@/utils/formatters";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface OrderCardProps {
  order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const router = useRouter();
  const statusColors = getOrderStatusColors(order.status);

  const handlePress = () => {
    router.push({
      pathname: "/(main)/order/[id]" as const,
      params: { id: order.id },
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      className="mx-4 mb-3 rounded-2xl border border-gray-100 p-4"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-row-reverse items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-text-main font-bold text-base text-right">
            {formatOrderId(order.id)}
          </Text>
          <Text className="text-text-muted text-sm text-right mt-1">
            {formatOrderDate(order.created_at)}
          </Text>
        </View>

        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: statusColors.background }}
        >
          <Text
            className="font-bold text-xs"
            style={{ color: statusColors.text }}
          >
            {getOrderStatusLabel(order.status)}
          </Text>
        </View>
      </View>

      <Text
        className="text-text-main font-medium text-base text-right mb-2"
        numberOfLines={1}
      >
        {order.vendor_name}
      </Text>

      <View className="flex-row-reverse items-center justify-between">
        <Text
          className="font-bold text-base"
          style={{ color: colors.primary.default }}
        >
          {formatPrice(order.grand_total)}
        </Text>

        <View className="flex-row-reverse items-center gap-x-1">
          <Text className="text-text-muted text-sm">التفاصيل</Text>
          <ChevronLeft size={16} color={colors.text.muted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};
