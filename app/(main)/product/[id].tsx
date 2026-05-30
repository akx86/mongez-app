import { useProductDetailsQuery } from "@/api/vendors/queries";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { colors } from "@/constants/theme";
import { Product, ProductAddon } from "@/types/schema.types";
import { useCartStore } from "@/store/cart.store";
import { formatPrice } from "@/utils/formatters";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, ChevronRight, Minus, Plus } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const IMAGE_HEIGHT = 256;
const BOTTOM_BAR_HEIGHT = 88;

const buildCartItemId = (productId: string, selectedAddons: string[]): string => {
  if (selectedAddons.length === 0) return productId;
  return `${productId}__${[...selectedAddons].sort().join("_")}`;
};

const buildCartItemName = (
  product: Product,
  selectedAddons: string[],
): string => {
  const addonNames =
    product.addons
      ?.filter((addon) => selectedAddons.includes(addon.id))
      .map((addon) => addon.name)
      .join("، ") ?? "";

  if (!addonNames) return product.name;
  return `${product.name} (+ ${addonNames})`;
};

interface AddonRowProps {
  addon: ProductAddon;
  isSelected: boolean;
  onToggle: (addonId: string) => void;
}

const AddonRow = ({ addon, isSelected, onToggle }: AddonRowProps) => (
  <TouchableOpacity
    onPress={() => onToggle(addon.id)}
    activeOpacity={0.85}
    className="flex-row-reverse items-center justify-between px-4 py-3 mb-2 rounded-xl border"
    style={{
      backgroundColor: colors.surface,
      borderColor: isSelected ? colors.primary.default : colors.gray[200],
      borderWidth: isSelected ? 2 : 1,
    }}
  >
    <View className="flex-row-reverse items-center gap-x-3 flex-1">
      <View
        className="w-6 h-6 rounded-md items-center justify-center border"
        style={{
          backgroundColor: isSelected ? colors.primary.default : colors.surface,
          borderColor: isSelected ? colors.primary.default : colors.gray[300],
        }}
      >
        {isSelected ? (
          <Check size={14} color={colors.text.inverse} strokeWidth={3} />
        ) : null}
      </View>
      <Text className="text-text-main font-medium text-base text-right flex-1">
        {addon.name}
      </Text>
    </View>
    <Text
      className="font-bold text-sm mr-3"
      style={{ color: colors.primary.default }}
    >
      +{formatPrice(addon.price)}
    </Text>
  </TouchableOpacity>
);

const ProductDetailsSkeleton = () => (
  <View className="flex-1 bg-background">
    <Skeleton width="100%" height={IMAGE_HEIGHT} borderRadius={0} />
    <View className="px-4 pt-6 gap-y-3">
      <Skeleton width="70%" height={28} borderRadius={8} />
      <Skeleton width="30%" height={22} borderRadius={6} />
      <Skeleton width="100%" height={60} borderRadius={8} />
    </View>
    <View className="px-4 pt-6 gap-y-2">
      <Skeleton width="40%" height={20} borderRadius={6} />
      <Skeleton width="100%" height={52} borderRadius={12} />
      <Skeleton width="100%" height={52} borderRadius={12} />
    </View>
  </View>
);

export default function ProductDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = id ?? "";

  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const addItem = useCartStore((state) => state.addItem);
  const updateQty = useCartStore((state) => state.updateQty);
  const clearCart = useCartStore((state) => state.clearCart);

  const { data: product, isLoading, isError } =
    useProductDetailsQuery(productId);

  const basePrice = product?.price ?? 0;

  const addonsPrice = useMemo(() => {
    if (!product?.addons?.length) return 0;
    return product.addons
      .filter((addon) => selectedAddons.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);
  }, [product?.addons, selectedAddons]);

  const unitPrice = basePrice + addonsPrice;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = useCallback((addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId],
    );
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const performAddToCart = useCallback(() => {
    if (!product) return;

    const cartItemId = buildCartItemId(product.id, selectedAddons);
    const cartItemName = buildCartItemName(product, selectedAddons);
    const existingItem = useCartStore
      .getState()
      .items.find((item) => item.id === cartItemId);

    if (existingItem) {
      updateQty(cartItemId, existingItem.quantity + quantity);
    } else {
      addItem(product.vendor_id, {
        id: cartItemId,
        name: cartItemName,
        price: unitPrice,
      });
      if (quantity > 1) {
        updateQty(cartItemId, quantity);
      }
    }

    router.back();
  }, [product, selectedAddons, quantity, unitPrice, addItem, updateQty, router]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    const { vendorId, items } = useCartStore.getState();
    const hasVendorConflict =
      vendorId !== null &&
      vendorId !== product.vendor_id &&
      items.length > 0;

    if (hasVendorConflict) {
      Alert.alert(
        "تغيير المطعم؟",
        "سلة المشتريات تحتوي على منتجات من مطعم آخر. هل تريد مسح السلة والبدء بطلب جديد من هذا المطعم؟",
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "تأكيد",
            onPress: () => {
              clearCart();
              performAddToCart();
            },
          },
        ],
      );
      return;
    }

    performAddToCart();
  }, [product, clearCart, performAddToCart]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ProductDetailsSkeleton />
      </SafeAreaView>
    );
  }

  if (isError || !product) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 px-4 justify-center items-center gap-y-4">
          <Text className="text-text-muted text-center text-base">
            تعذّر تحميل تفاصيل المنتج. حاول مرة أخرى.
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

  const hasAddons = (product.addons?.length ?? 0) > 0;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: BOTTOM_BAR_HEIGHT + insets.bottom + 24,
        }}
      >
        <View className="relative w-full" style={{ height: IMAGE_HEIGHT }}>
          <Image
            source={{ uri: product.image_url }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
          />

          <SafeAreaView
            edges={["top"]}
            className="absolute top-0 right-0 left-0"
          >
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.85}
              className="m-4 w-10 h-10 rounded-full bg-surface/95 items-center justify-center border border-gray-100 self-end"
            >
              <ChevronRight size={22} color={colors.text.main} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View className="px-4 pt-6 pb-4">
          <Text className="text-text-main font-bold text-2xl text-right mb-2">
            {product.name}
          </Text>
          <Text
            className="font-bold text-xl text-right mb-4"
            style={{ color: colors.primary.default }}
          >
            {formatPrice(basePrice)}
          </Text>
          {product.description ? (
            <Text className="text-text-muted text-base text-right leading-6">
              {product.description}
            </Text>
          ) : null}
        </View>

        {hasAddons ? (
          <View className="px-4 pb-6">
            <Text className="text-text-main font-bold text-lg text-right mb-3">
              الإضافات
            </Text>
            {product.addons!.map((addon) => (
              <AddonRow
                key={addon.id}
                addon={addon}
                isSelected={selectedAddons.includes(addon.id)}
                onToggle={toggleAddon}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View
        className="absolute left-0 right-0 border-t border-gray-100 px-4 pt-3 flex-row-reverse items-center gap-x-3"
        style={{
          bottom: 0,
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: colors.surface,
        }}
      >
        <View
          className="flex-row-reverse items-center rounded-full border px-2 py-1"
          style={{ borderColor: colors.gray[200], backgroundColor: colors.background }}
        >
          <TouchableOpacity
            onPress={decrementQuantity}
            activeOpacity={0.7}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.surface }}
          >
            <Minus size={18} color={colors.text.main} />
          </TouchableOpacity>

          <Text className="text-text-main font-bold text-lg mx-4 min-w-[24px] text-center">
            {quantity}
          </Text>

          <TouchableOpacity
            onPress={incrementQuantity}
            activeOpacity={0.7}
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.surface }}
          >
            <Plus size={18} color={colors.text.main} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleAddToCart}
          activeOpacity={0.9}
          className="flex-1 py-3.5 rounded-xl items-center justify-center"
          style={{ backgroundColor: colors.primary.default }}
        >
          <Text
            className="font-bold text-base"
            style={{ color: colors.text.inverse }}
          >
            إضافة للسلة · {formatPrice(totalPrice)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
