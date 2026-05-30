import { createOrderInFirestore } from "@/api/orders/mutations";
import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/theme";
import {
  createOrderSchema,
  CreateOrderFormValues,
} from "@/schemas/createOrder.schema";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { CreateOrderPayload } from "@/types/api.types";
import { Address, Customer, Item, PaymentMethod } from "@/types/schema.types";
import { formatPrice } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { ChevronRight, CreditCard, MapPin, Minus, Plus, ShoppingBag, Wallet } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
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

const MOCK_DELIVERY_FEE = 15;

export const isProfileComplete = (user: Customer): boolean => {
  if (!user.full_name?.trim() || user.full_name.trim().length < 3) {
    return false;
  }

  const address = user.address_details;
  if (!address) return false;

  const { city, street, building, coordinates } = address;
  return (
    !!city?.trim() &&
    !!street?.trim() &&
    !!building?.trim() &&
    typeof coordinates?.lat === "number" &&
    typeof coordinates?.lng === "number"
  );
};

const formatAddressLine = (address: Address): string => {
  const parts = [
    address.city,
    address.street,
    `مبنى ${address.building}`,
  ];

  if (address.floor) parts.push(`الدور ${address.floor}`);
  if (address.apartment) parts.push(`شقة ${address.apartment}`);

  return parts.join("، ");
};

interface CartItemRowProps {
  item: Item;
  onDecrement: (id: string, qty: number) => void;
  onIncrement: (id: string, qty: number) => void;
}

const CartItemRow = ({ item, onDecrement, onIncrement }: CartItemRowProps) => {
  const rowTotal = item.price * item.quantity;

  return (
    <View
      className="mx-4 mb-3 rounded-2xl border border-gray-100 p-4"
      style={{ backgroundColor: colors.surface }}
    >
      <Text
        className="text-text-main font-bold text-base text-right mb-1"
        numberOfLines={2}
      >
        {item.name}
      </Text>

      <Text className="text-text-muted text-sm text-right mb-3">
        {formatPrice(item.price)} / وحدة
      </Text>

      <View className="flex-row-reverse items-center justify-between">
        <Text
          className="font-bold text-base"
          style={{ color: colors.primary.default }}
        >
          {formatPrice(rowTotal)}
        </Text>

        <View
          className="flex-row-reverse items-center rounded-full border px-1.5 py-1"
          style={{
            borderColor: colors.gray[200],
            backgroundColor: colors.background,
          }}
        >
          <TouchableOpacity
            onPress={() => onDecrement(item.id, item.quantity)}
            activeOpacity={0.7}
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.surface }}
          >
            <Minus size={16} color={colors.text.main} />
          </TouchableOpacity>

          <Text className="text-text-main font-bold text-base mx-3 min-w-[20px] text-center">
            {item.quantity}
          </Text>

          <TouchableOpacity
            onPress={() => onIncrement(item.id, item.quantity)}
            activeOpacity={0.7}
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.surface }}
          >
            <Plus size={16} color={colors.text.main} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

interface ReceiptSummaryProps {
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
}

const ReceiptSummary = ({
  subtotal,
  deliveryFee,
  grandTotal,
}: ReceiptSummaryProps) => (
  <View
    className="mx-4 mt-2 mb-4 rounded-2xl border border-gray-100 p-4"
    style={{ backgroundColor: colors.surface }}
  >
    <Text className="text-text-main font-bold text-lg text-right mb-4">
      ملخص الطلب
    </Text>

    <View className="flex-row-reverse items-center justify-between mb-3">
      <Text className="text-text-muted text-base">المجموع الفرعي</Text>
      <Text className="text-text-main font-medium text-base">
        {formatPrice(subtotal)}
      </Text>
    </View>

    <View className="flex-row-reverse items-center justify-between mb-3">
      <Text className="text-text-muted text-base">رسوم التوصيل</Text>
      <Text className="text-text-main font-medium text-base">
        {formatPrice(deliveryFee)}
      </Text>
    </View>

    <View
      className="border-t pt-3 flex-row-reverse items-center justify-between"
      style={{ borderColor: colors.gray[200] }}
    >
      <Text className="text-text-main font-bold text-lg">الإجمالي</Text>
      <Text
        className="font-bold text-xl"
        style={{ color: colors.primary.default }}
      >
        {formatPrice(grandTotal)}
      </Text>
    </View>
  </View>
);

interface PaymentToggleProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const PaymentToggle = ({ value, onChange }: PaymentToggleProps) => (
  <View className="mx-4 mb-4">
    <Text className="text-text-main font-bold text-lg text-right mb-3">
      طريقة الدفع
    </Text>

    <View className="flex-row-reverse gap-x-3">
      <TouchableOpacity
        onPress={() => onChange("cash")}
        activeOpacity={0.85}
        className="flex-1 flex-row-reverse items-center justify-center gap-x-2 py-4 rounded-xl border"
        style={{
          backgroundColor: value === "cash" ? colors.primary.default : colors.surface,
          borderColor: value === "cash" ? colors.primary.default : colors.gray[200],
        }}
      >
        <Wallet
          size={20}
          color={value === "cash" ? colors.text.inverse : colors.text.main}
        />
        <Text
          className="font-bold text-base"
          style={{
            color: value === "cash" ? colors.text.inverse : colors.text.main,
          }}
        >
          كاش
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onChange("visa")}
        activeOpacity={0.85}
        className="flex-1 flex-row-reverse items-center justify-center gap-x-2 py-4 rounded-xl border"
        style={{
          backgroundColor: value === "visa" ? colors.primary.default : colors.surface,
          borderColor: value === "visa" ? colors.primary.default : colors.gray[200],
        }}
      >
        <CreditCard
          size={20}
          color={value === "visa" ? colors.text.inverse : colors.text.main}
        />
        <Text
          className="font-bold text-base"
          style={{
            color: value === "visa" ? colors.text.inverse : colors.text.main,
          }}
        >
          فيزا
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

interface DeliveryAddressCardProps {
  address: Address;
}

const DeliveryAddressCard = ({ address }: DeliveryAddressCardProps) => (
  <View
    className="mx-4 mb-4 rounded-2xl border border-gray-100 p-4"
    style={{ backgroundColor: colors.surface }}
  >
    <View className="flex-row-reverse items-center gap-x-2 mb-3">
      <MapPin size={18} color={colors.primary.default} />
      <Text className="text-text-main font-bold text-lg text-right flex-1">
        عنوان التوصيل
      </Text>
    </View>

    <Text className="text-text-main text-base text-right leading-6 mb-2">
      {formatAddressLine(address)}
    </Text>

    <Text className="text-text-muted text-sm text-right">
      {address.coordinates.lat.toFixed(4)}, {address.coordinates.lng.toFixed(4)}
    </Text>
  </View>
);

interface CheckoutFormProps {
  address: Address;
  control: ReturnType<typeof useForm<CreateOrderFormValues>>["control"];
}

const CheckoutForm = ({ address, control }: CheckoutFormProps) => (
  <View className="mb-4">
    <Controller
      control={control}
      name="payment_method"
      render={({ field: { value, onChange } }) => (
        <PaymentToggle value={value} onChange={onChange} />
      )}
    />
    <DeliveryAddressCard address={address} />
  </View>
);

const CartEmptyState = ({ onGoHome }: { onGoHome: () => void }) => (
  <View className="flex-1 px-4 justify-center items-center">
    <View
      className="w-24 h-24 rounded-full items-center justify-center mb-6"
      style={{ backgroundColor: colors.gray[100] }}
    >
      <ShoppingBag size={40} color={colors.text.muted} />
    </View>

    <Text className="text-text-main font-bold text-xl text-center mb-2">
      سلة المشتريات فارغة
    </Text>
    <Text className="text-text-muted text-base text-center mb-8 leading-6">
      لم تضف أي منتجات بعد. تصفّح المطاعم وابدأ بطلبك الأول!
    </Text>

    <Button
      title="العودة للرئيسية"
      onPress={onGoHome}
      className="w-full max-w-xs"
    />
  </View>
);

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items = useCartStore((state) => state.items);
  const vendorId = useCartStore((state) => state.vendorId);
  const updateQty = useCartStore((state) => state.updateQty);
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useAuthStore((state) => state.user);

  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      vendor_id: "",
      payment_method: "cash",
      items: [],
      delivery_address: {
        city: "",
        street: "",
        building: "",
        coordinates: { lat: 0, lng: 0 },
      },
    },
    mode: "onChange",
  });

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const deliveryFee = items.length > 0 ? MOCK_DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;
  const isEmpty = items.length === 0;

  useEffect(() => {
    if (!showCheckoutForm || !user?.address_details || !vendorId) return;

    reset({
      vendor_id: vendorId,
      payment_method: "cash",
      items: items.map(({ id, quantity, price, name }) => ({
        id,
        quantity,
        price,
        name,
      })),
      delivery_address: user.address_details,
    });
  }, [showCheckoutForm, vendorId, items, user, reset]);

  const handleDecrement = (id: string, currentQty: number) => {
    updateQty(id, currentQty - 1);
  };

  const handleIncrement = (id: string, currentQty: number) => {
    updateQty(id, currentQty + 1);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }

    if (!isProfileComplete(user)) {
      router.push("/(auth)/profile-setup");
      return;
    }

    if (!vendorId) {
      Alert.alert("خطأ", "لا يمكن إتمام الطلب بدون متجر محدد.");
      return;
    }

    setShowCheckoutForm(true);
  };

  const onSubmitOrder = async (formData: CreateOrderFormValues) => {
    if (!user?.address_details) {
      Alert.alert("خطأ", "يرجى إكمال عنوان التوصيل في ملفك الشخصي.");
      return;
    }

    const payload: CreateOrderPayload = {
      vendor_id: formData.vendor_id,
      payment_method: formData.payment_method,
      items: formData.items.map(({ id, quantity, price, name }) => ({
        id,
        quantity,
        price,
        name,
      })),
      delivery_address: {
        city: formData.delivery_address.city,
        street: formData.delivery_address.street,
        building: formData.delivery_address.building,
        floor: formData.delivery_address.floor,
        apartment: formData.delivery_address.apartment,
        coordinates: {
          lat: formData.delivery_address.coordinates.lat,
          lng: formData.delivery_address.coordinates.lng,
        },
      },
    };

    try {
      setIsSubmitting(true);
      createOrderSchema.parse(payload);
      console.log("FINAL ORDER PAYLOAD:", payload);

      const newOrderId = await createOrderInFirestore({
        payload,
        customerId: user.id,
        deliveryFee,
      });

      clearCart();
      setShowCheckoutForm(false);

      router.replace({
        pathname: "/(main)/order/[id]" as const,
        params: { id: newOrderId },
      });
    } catch (error) {
      console.error("Order validation/submission failed:", error);
      Alert.alert("خطأ", "تعذّر إتمام الطلب. يرجى مراجعة البيانات والمحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top", "left", "right"]}
    >
      <View className="flex-row-reverse items-center px-4 py-3 border-b border-gray-100">
        <Text className="flex-1 text-text-main font-bold text-xl text-right">
          سلة المشتريات
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

      {isEmpty ? (
        <CartEmptyState onGoHome={() => router.push("/(tabs)")} />
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: 120 + insets.bottom,
            }}
          >
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onDecrement={handleDecrement}
                onIncrement={handleIncrement}
              />
            ))}

            <ReceiptSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              grandTotal={grandTotal}
            />

            {showCheckoutForm && user?.address_details ? (
              <CheckoutForm
                address={user.address_details}
                control={control}
              />
            ) : null}
          </ScrollView>

          <View
            className="absolute left-0 right-0 border-t border-gray-100 px-4 pt-3"
            style={{
              bottom: 0,
              paddingBottom: Math.max(insets.bottom, 12),
              backgroundColor: colors.surface,
            }}
          >
            {showCheckoutForm ? (
              <TouchableOpacity
                onPress={handleSubmit(onSubmitOrder)}
                activeOpacity={0.9}
                disabled={isSubmitting}
                className="py-4 rounded-xl items-center justify-center flex-row-reverse gap-x-2"
                style={{
                  backgroundColor: colors.primary.default,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : null}
                <Text
                  className="font-bold text-base"
                  style={{ color: colors.text.inverse }}
                >
                  {isSubmitting
                    ? "جاري إرسال الطلب..."
                    : `تأكيد الطلب · ${formatPrice(grandTotal)}`}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleProceedToCheckout}
                activeOpacity={0.9}
                className="py-4 rounded-xl items-center justify-center"
                style={{ backgroundColor: colors.primary.default }}
              >
                <Text
                  className="font-bold text-base"
                  style={{ color: colors.text.inverse }}
                >
                  إتمام الطلب · {formatPrice(grandTotal)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
