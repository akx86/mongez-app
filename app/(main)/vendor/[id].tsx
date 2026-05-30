import {
  useVendorDetailsQuery,
  useVendorMenuSectionsQuery,
  useVendorProductsQuery,
} from "@/api/vendors/queries";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { colors } from "@/constants/theme";
import { MenuSection, Product, Vendor } from "@/types/schema.types";
import {
  formatDeliveryFee,
  formatDeliveryTime,
  formatPrice,
  formatRating,
} from "@/utils/formatters";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Clock, Star } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COVER_HEIGHT = 200;
const LOGO_SIZE = 72;
const ESTIMATED_ITEM_SIZE = 96;

type VendorListItem =
  | { type: "tabs"; key: "menu-tabs" }
  | { type: "section-header"; key: string; section: MenuSection }
  | { type: "product"; key: string; product: Product };

const abbreviateText = (text?: string, maxLength = 64): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

const formatReviewsLabel = (count: number): string => {
  if (count >= 120) return "120+";
  return String(count);
};

interface VendorHeaderProps {
  vendor: Vendor;
  onBack: () => void;
}

const VendorHeader = ({ vendor, onBack }: VendorHeaderProps) => (
  <View className="bg-background">
    <View className="relative" style={{ height: COVER_HEIGHT }}>
      <Image
        source={{ uri: vendor.cover_url || vendor.logo_url }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={300}
      />

      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.85}
        className="absolute top-3 right-4 w-10 h-10 rounded-full bg-surface/95 items-center justify-center border border-gray-100"
      >
        <ChevronRight size={22} color={colors.text.main} />
      </TouchableOpacity>

      <View
        className="absolute bg-surface rounded-2xl overflow-hidden border-2 border-surface shadow-sm"
        style={{
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          bottom: -LOGO_SIZE / 2,
          right: 16,
        }}
      >
        <Image
          source={{ uri: vendor.logo_url }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={200}
        />
      </View>
    </View>

    <View className="px-4 pt-12 pb-4">
      <Text className="text-text-main font-bold text-2xl text-right mb-2">
        {vendor.name}
      </Text>

      <View className="flex-row-reverse items-center justify-end gap-x-4 mb-3">
        <View className="flex-row-reverse items-center gap-x-1">
          <Star size={16} color="#F59E0B" fill="#F59E0B" />
          <Text className="text-text-main font-bold text-base">
            {formatRating(vendor.rating)}
          </Text>
          <Text className="text-text-muted text-sm">
            ({formatReviewsLabel(vendor.reviews_count)})
          </Text>
        </View>

        <View className="flex-row-reverse items-center gap-x-1">
          <Clock size={15} color={colors.text.muted} />
          <Text className="text-text-muted text-sm">
            {formatDeliveryTime(
              vendor.delivery_time_min,
              vendor.delivery_time_max,
            )}
          </Text>
        </View>
      </View>

      <Text className="text-primary font-medium text-sm text-right">
        {formatDeliveryFee(vendor.delivery_fee)}
      </Text>
    </View>
  </View>
);

interface MenuTabsProps {
  sections: MenuSection[];
  activeSectionId: string | null;
  onSelect: (sectionId: string) => void;
}

const MenuTabs = ({ sections, activeSectionId, onSelect }: MenuTabsProps) => (
  <View
    className="bg-background border-b border-gray-100 py-3"
    style={{ backgroundColor: colors.background }}
  >
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        gap: 8,
        flexDirection: "row-reverse",
      }}
    >
      {sections.map((section) => {
        const isActive = activeSectionId === section.id;
        return (
          <TouchableOpacity
            key={section.id}
            onPress={() => onSelect(section.id)}
            activeOpacity={0.8}
            className="px-4 py-2 rounded-full border"
            style={{
              backgroundColor: isActive ? colors.primary.default : colors.surface,
              borderColor: isActive ? colors.primary.default : colors.gray[200],
            }}
          >
            <Text
              className="font-medium text-sm"
              style={{
                color: isActive ? colors.text.inverse : colors.text.main,
              }}
            >
              {section.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

interface ProductRowProps {
  product: Product;
  onPress: (product: Product) => void;
}

const ProductRow = ({ product, onPress }: ProductRowProps) => (
  <TouchableOpacity
    onPress={() => onPress(product)}
    activeOpacity={0.85}
    className="mx-4 mb-3 bg-surface rounded-2xl border border-gray-100 flex-row-reverse overflow-hidden"
  >
    <View className="w-20 h-20 bg-gray-100 m-3 rounded-xl overflow-hidden">
      <Image
        source={{ uri: product.image_url }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={200}
      />
    </View>

    <View className="flex-1 py-3 pl-3 justify-center">
      <Text
        className="text-text-main font-bold text-base text-right mb-1"
        numberOfLines={1}
      >
        {product.name}
      </Text>
      {product.description ? (
        <Text
          className="text-text-muted text-sm text-right mb-2"
          numberOfLines={2}
        >
          {abbreviateText(product.description)}
        </Text>
      ) : null}
      <Text className="text-primary font-bold text-base text-right">
        {formatPrice(product.price)}
      </Text>
    </View>
  </TouchableOpacity>
);

const VendorDetailsSkeleton = () => (
  <View className="flex-1 bg-background">
    <Skeleton width="100%" height={COVER_HEIGHT} borderRadius={0} />
    <View className="px-4 pt-12 pb-4 gap-y-3">
      <Skeleton width="60%" height={28} borderRadius={8} />
      <Skeleton width="40%" height={18} borderRadius={6} />
      <Skeleton width="30%" height={16} borderRadius={6} />
    </View>
    <View className="px-4 py-3 flex-row-reverse gap-x-2">
      <Skeleton width={80} height={36} borderRadius={20} />
      <Skeleton width={80} height={36} borderRadius={20} />
      <Skeleton width={80} height={36} borderRadius={20} />
    </View>
    {[1, 2, 3].map((i) => (
      <View
        key={i}
        className="mx-4 mb-3 bg-surface rounded-2xl border border-gray-100 flex-row-reverse p-3"
      >
        <Skeleton width={80} height={80} borderRadius={12} />
        <View className="flex-1 mr-3 gap-y-2 justify-center">
          <Skeleton width="70%" height={16} borderRadius={4} />
          <Skeleton width="90%" height={12} borderRadius={4} />
          <Skeleton width="35%" height={14} borderRadius={4} />
        </View>
      </View>
    ))}
  </View>
);

export default function VendorDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string; name?: string }>();
  const vendorId = id ?? "";

  const listRef = useRef<FlashListRef<VendorListItem>>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const {
    data: vendor,
    isLoading: isVendorLoading,
    isError: isVendorError,
  } = useVendorDetailsQuery(vendorId);

  const {
    data: sections = [],
    isLoading: isSectionsLoading,
    isError: isSectionsError,
  } = useVendorMenuSectionsQuery(vendorId);

  const {
    data: products = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useVendorProductsQuery(vendorId);

  const isLoading = isVendorLoading || isSectionsLoading || isProductsLoading;
  const isError = isVendorError || isSectionsError || isProductsError;

  const { listItems, sectionIndexMap } = useMemo(() => {
    const items: VendorListItem[] = [{ type: "tabs", key: "menu-tabs" }];
    const indexMap: Record<string, number> = {};

    for (const section of sections) {
      indexMap[section.id] = items.length;
      items.push({
        type: "section-header",
        key: `section-${section.id}`,
        section,
      });

      const sectionProducts = products.filter(
        (product) => product.section_id === section.id,
      );

      for (const product of sectionProducts) {
        items.push({ type: "product", key: product.id, product });
      }
    }

    return { listItems: items, sectionIndexMap: indexMap };
  }, [sections, products]);

  const resolvedActiveSectionId =
    activeSectionId ?? sections[0]?.id ?? null;

  const handleSectionSelect = useCallback(
    (sectionId: string) => {
      setActiveSectionId(sectionId);
      const targetIndex = sectionIndexMap[sectionId];
      if (targetIndex !== undefined) {
        listRef.current?.scrollToIndex({
          index: targetIndex,
          animated: true,
          viewOffset: 52,
        });
      }
    },
    [sectionIndexMap],
  );

  const handleProductPress = useCallback(
    (product: Product) => {
      router.push({
        pathname: "/(main)/product/[id]" as any,
        params: { id: product.id },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: VendorListItem }) => {
      switch (item.type) {
        case "tabs":
          return (
            <MenuTabs
              sections={sections}
              activeSectionId={resolvedActiveSectionId}
              onSelect={handleSectionSelect}
            />
          );
        case "section-header":
          return (
            <View className="px-4 pt-4 pb-2 bg-background">
              <Text className="text-text-main font-bold text-lg text-right">
                {item.section.title}
              </Text>
            </View>
          );
        case "product":
          return (
            <ProductRow product={item.product} onPress={handleProductPress} />
          );
      }
    },
    [
      sections,
      resolvedActiveSectionId,
      handleSectionSelect,
      handleProductPress,
    ],
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <VendorDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (isError || !vendor) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 px-4 justify-center items-center gap-y-4">
          <Text className="text-text-muted text-center text-base">
            تعذّر تحميل بيانات المتجر. حاول مرة أخرى.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="px-6 py-3 rounded-xl"
            style={{ backgroundColor: colors.primary.default }}
          >
            <Text style={{ color: colors.text.inverse }} className="font-bold">
              رجوع
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlashList
        ref={listRef}
        data={listItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        getItemType={(item) => item.type}
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <VendorHeader vendor={vendor} onBack={() => router.back()} />
        }
        ListEmptyComponent={
          <View className="py-16 px-4 items-center">
            <Text className="text-text-muted text-center">
              لا توجد منتجات متاحة حالياً في هذا المتجر.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
