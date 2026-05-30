import { useOrderTracking } from "@/api/orders/queries";
import { OrderProgressTracker } from "@/components/orders/OrderProgressTracker";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { colors } from "@/constants/theme";
import { Address, Order } from "@/types/schema.types";
import { formatPrice } from "@/utils/formatters";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, MapPin } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatAddressLine = (address: Address): string => {
  const parts = [address.city, address.street, `مبنى ${address.building}`];
  if (address.floor) parts.push(`الدور ${address.floor}`);
  if (address.apartment) parts.push(`شقة ${address.apartment}`);
  return parts.join("، ");
};

const formatItemsSummary = (order: Order): string =>
  order.items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join("، ");

const formatOrderLabel = (orderId: string): string => {
  const suffix = orderId.slice(-6).toUpperCase();
  return `طلب #${suffix}`;
};

const OrderTrackingSkeleton = () => (
  <View className="flex-1 bg-background px-4 pt-4">
    <Skeleton width="50%" height={28} borderRadius={8} className="mb-6" />
    <Skeleton width="100%" height={280} borderRadius={16} className="mb-4" />
    <Skeleton width="100%" height={200} borderRadius={16} />
  </View>
);

interface OrderDetailsCardProps {
  order: Order;
}

const OrderDetailsCard = ({ order }: OrderDetailsCardProps) => (
  <View
    className="mx-4 mb-6 rounded-2xl border border-gray-100 p-4"
    style={{ backgroundColor: colors.surface }}
  >
    <Text className="text-text-main font-bold text-lg text-right mb-4">
      تفاصيل الطلب
    </Text>

    <View className="mb-3">
      <Text className="text-text-muted text-sm text-right mb-1">المطعم</Text>
      <Text className="text-text-main font-bold text-base text-right">
        {order.vendor_name}
      </Text>
    </View>

    <View className="mb-3">
      <Text className="text-text-muted text-sm text-right mb-1">المنتجات</Text>
      <Text className="text-text-main text-base text-right leading-6">
        {formatItemsSummary(order)}
      </Text>
    </View>

    <View className="mb-3">
      <Text className="text-text-muted text-sm text-right mb-1">
        المبلغ المدفوع
      </Text>
      <Text
        className="font-bold text-xl text-right"
        style={{ color: colors.primary.default }}
      >
        {formatPrice(order.grand_total)}
      </Text>
    </View>

    <View
      className="pt-3 border-t"
      style={{ borderColor: colors.gray[200] }}
    >
      <View className="flex-row-reverse items-center gap-x-2 mb-2">
        <MapPin size={16} color={colors.primary.default} />
        <Text className="text-text-muted text-sm text-right">عنوان التوصيل</Text>
      </View>
      <Text className="text-text-main text-base text-right leading-6">
        {formatAddressLine(order.delivery_address)}
      </Text>
    </View>
  </View>
);

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = id ?? "";

  const { order, isLoading, error } = useOrderTracking(orderId);

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top", "left", "right"]}
    >
      <View
        className="flex-row-reverse items-center px-4 py-3 border-b border-gray-100 z-10"
        style={{ backgroundColor: colors.background }}
      >
        <Text className="flex-1 text-text-main font-bold text-xl text-right">
          {order ? formatOrderLabel(order.id) : "تتبع الطلب"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surface }}
        >
          <ChevronRight size={22} color={colors.text.main} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <OrderTrackingSkeleton />
      ) : error || !order ? (
        <View className="flex-1 px-4 justify-center items-center">
          <Text className="text-text-muted text-center text-base mb-4">
            {error ?? "تعذّر تحميل بيانات الطلب."}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            className="px-6 py-3 rounded-xl"
            style={{ backgroundColor: colors.primary.default }}
          >
            <Text style={{ color: colors.text.inverse }} className="font-bold">
              العودة للرئيسية
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        >
          <OrderProgressTracker status={order.status} />
          <OrderDetailsCard order={order} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
