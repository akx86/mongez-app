import { useActiveOrders, usePastOrders } from "@/api/orders/queries";
import { OrderCard } from "@/components/orders/OrderCard";
import {
  OrdersSegmentedControl,
  OrdersTab,
} from "@/components/orders/OrdersSegmentedControl";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { colors } from "@/constants/theme";
import { useAuthStore } from "@/store/auth.store";
import { Order } from "@/types/schema.types";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { ClipboardList } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ESTIMATED_ITEM_SIZE = 132;

const OrdersListSkeleton = () => (
  <View className="px-4 pt-2 gap-y-3">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} width="100%" height={120} borderRadius={16} />
    ))}
  </View>
);

interface OrdersEmptyStateProps {
  message: string;
}

const OrdersEmptyState = ({ message }: OrdersEmptyStateProps) => (
  <View className="flex-1 px-4 justify-center items-center py-16">
    <View
      className="w-20 h-20 rounded-full items-center justify-center mb-4"
      style={{ backgroundColor: colors.gray[100] }}
    >
      <ClipboardList size={36} color={colors.text.muted} />
    </View>
    <Text className="text-text-muted text-center text-base leading-6">
      {message}
    </Text>
  </View>
);

const GuestOrdersState = ({ onLogin }: { onLogin: () => void }) => (
  <View className="flex-1 px-4 justify-center items-center">
    <View
      className="w-24 h-24 rounded-full items-center justify-center mb-6"
      style={{ backgroundColor: colors.gray[100] }}
    >
      <ClipboardList size={44} color={colors.text.muted} />
    </View>
    <Text className="text-text-main font-bold text-xl text-center mb-2">
      سجل الدخول لرؤية طلباتك
    </Text>
    <Text className="text-text-muted text-base text-center mb-8 leading-6">
      تابع طلباتك الحالية واطّلع على سجل مشترياتك بعد تسجيل الدخول.
    </Text>
    <Button title="تسجيل الدخول" onPress={onLogin} className="w-full max-w-xs" />
  </View>
);

export default function OrdersScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const customerId = user?.id;

  const [activeTab, setActiveTab] = useState<OrdersTab>("active");

  const {
    data: activeOrders = [],
    isLoading: isActiveLoading,
    isError: isActiveError,
  } = useActiveOrders(customerId);

  const {
    data: pastPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPastLoading,
    isError: isPastError,
  } = usePastOrders(customerId);

  const pastOrders = useMemo(
    () => pastPages?.pages.flatMap((page) => page.orders) ?? [],
    [pastPages],
  );

  const listData: Order[] = activeTab === "active" ? activeOrders : pastOrders;
  const isLoading = activeTab === "active" ? isActiveLoading : isPastLoading;
  const isError = activeTab === "active" ? isActiveError : isPastError;

  const emptyMessage =
    activeTab === "active"
      ? "لا توجد طلبات حالية"
      : "لا توجد طلبات سابقة";

  const handleEndReached = useCallback(() => {
    if (activeTab === "past" && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [activeTab, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Order }) => <OrderCard order={item} />,
    [],
  );

  const ListFooterComponent = useMemo(() => {
    if (activeTab !== "past" || !isFetchingNextPage) return null;
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color={colors.primary.default} />
      </View>
    );
  }, [activeTab, isFetchingNextPage]);

  if (!user) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        edges={["top", "left", "right"]}
      >
        <View className="px-4 py-4 border-b border-gray-100">
          <Text className="text-text-main font-bold text-2xl text-right">
            طلباتي
          </Text>
        </View>
        <GuestOrdersState onLogin={() => router.push("/(auth)/login")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top", "left", "right"]}
    >
      <View className="px-4 py-4 border-b border-gray-100">
        <Text className="text-text-main font-bold text-2xl text-right">
          طلباتي
        </Text>
      </View>

      <OrdersSegmentedControl activeTab={activeTab} onTabChange={setActiveTab} />

      {isLoading ? (
        <OrdersListSkeleton />
      ) : isError ? (
        <OrdersEmptyState message="تعذّر تحميل الطلبات. حاول مرة أخرى." />
      ) : (
        <FlashList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={ESTIMATED_ITEM_SIZE}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={<OrdersEmptyState message={emptyMessage} />}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
}
