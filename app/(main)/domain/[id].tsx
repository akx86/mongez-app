import { useDomainVendors } from "@/api/vendors/queries";
import { HomeBanners } from "@/components/domain/HomeBanners";
import { TopVendors } from "@/components/domain/TopVendors";
import { SearchBar } from "@/components/ui/SearchBar";
import { colors } from "@/constants/theme";
import { formatDeliveryTime, formatRating } from "@/utils/formatters";
import { Vendor } from "@/types/schema.types";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Clock, Star } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VENDOR_CARD_ESTIMATED_HEIGHT = 120;

interface DomainListHeaderProps {
  title: string;
  domainId: string;
  searchText: string;
  onSearchChange: (text: string) => void;
  onBack: () => void;
}

const DomainListHeader = ({
  title,
  domainId,
  searchText,
  onSearchChange,
  onBack,
}: DomainListHeaderProps) => (
  <View className="bg-background">
    <View className="flex-row items-center px-4 pt-2 pb-3 gap-x-3">
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-full bg-surface items-center justify-center border border-gray-100"
      >
        <ChevronRight size={22} color={colors.text.main} />
      </TouchableOpacity>
      <Text
        className="flex-1 text-text-main font-bold text-xl text-right"
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>

    <View className="px-4 pb-3">
      <SearchBar
        value={searchText}
        onChangeText={onSearchChange}
        placeholder="ابحث في هذا القسم..."
      />
    </View>

    <HomeBanners domainId={domainId} />
    <TopVendors domainId={domainId} />

    <View className="px-4 pt-2 pb-3">
      <Text className="text-text-main font-bold text-lg text-right">
        كل المتاجر
      </Text>
    </View>
  </View>
);

interface VendorListCardProps {
  vendor: Vendor;
  onPress: (vendor: Vendor) => void;
}

const VendorListCard = ({ vendor, onPress }: VendorListCardProps) => (
  <TouchableOpacity
    onPress={() => onPress(vendor)}
    activeOpacity={0.85}
    className="mx-4 mb-3 bg-surface rounded-2xl overflow-hidden border border-gray-100 flex-row-reverse"
  >
    <View className="w-28 h-28 bg-gray-100">
      <Image
        source={{ uri: vendor.cover_url || vendor.logo_url }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={200}
      />
    </View>

    <View className="flex-1 p-3 justify-center">
      <Text
        className="text-text-main font-bold text-base text-right mb-2"
        numberOfLines={1}
      >
        {vendor.name}
      </Text>

      <View className="flex-row-reverse items-center justify-end gap-x-4">
        <View className="flex-row-reverse items-center gap-x-1">
          <Star size={14} color="#F59E0B" fill="#F59E0B" />
          <Text className="text-text-main font-medium text-sm">
            {vendor.rating ? formatRating(vendor.rating) : "جديد"}
          </Text>
        </View>

        <View className="flex-row-reverse items-center gap-x-1">
          <Clock size={14} color={colors.text.muted} />
          <Text className="text-text-muted text-sm">
            {formatDeliveryTime(
              vendor.delivery_time_min,
              vendor.delivery_time_max,
            )}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function DomainScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams<{
    id: string;
    title?: string;
  }>();

  const domainId = id ?? "";
  const domainTitle = title ?? "القسم";

  const [searchText, setSearchText] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useDomainVendors(domainId);

  const vendors = useMemo(
    () => data?.pages.flatMap((page) => page.vendors) ?? [],
    [data],
  );

  const filteredVendors = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return vendors;
    return vendors.filter((vendor) =>
      vendor.name.toLowerCase().includes(query),
    );
  }, [vendors, searchText]);

  const handleVendorPress = useCallback(
    (vendor: Vendor) => {
      router.push({
        pathname: "/(main)/vendor/[id]" as any,
        params: { id: vendor.id, name: vendor.name },
      });
    },
    [router],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Vendor }) => (
      <VendorListCard vendor={item} onPress={handleVendorPress} />
    ),
    [handleVendorPress],
  );

  const ListFooterComponent = useMemo(
    () =>
      isFetchingNextPage ? (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color={colors.primary.default} />
        </View>
      ) : null,
    [isFetchingNextPage],
  );

  const ListEmptyComponent = useMemo(() => {
    if (isLoading) {
      return (
        <View className="py-16 items-center">
          <ActivityIndicator size="large" color={colors.primary.default} />
        </View>
      );
    }

    if (isError) {
      return (
        <View className="py-16 px-4 items-center">
          <Text className="text-text-muted text-center">
            حدث خطأ أثناء تحميل المتاجر. حاول مرة أخرى.
          </Text>
        </View>
      );
    }

    return (
      <View className="py-16 px-4 items-center">
        <Text className="text-text-muted text-center">
          {searchText.trim()
            ? "لا توجد نتائج مطابقة لبحثك."
            : "لا توجد متاجر في هذا القسم حالياً."}
        </Text>
      </View>
    );
  }, [isLoading, isError, searchText]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <FlashList
        data={filteredVendors}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <DomainListHeader
            title={domainTitle}
            domainId={domainId}
            searchText={searchText}
            onSearchChange={setSearchText}
            onBack={() => router.back()}
          />
        }
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        estimatedItemSize={VENDOR_CARD_ESTIMATED_HEIGHT}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
