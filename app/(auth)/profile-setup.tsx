import { createCustomerProfile } from "@/api/customers/mutations";
import { ScreenWrapper } from "@/components/layouts/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@store/auth.store";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, Text, View } from "react-native";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  city: z.string().min(2, "اسم المدينة مطلوب"),
  street: z.string().min(3, "اسم الشارع مطلوب"),
  building: z.string().min(1, "رقم أو اسم المبنى مطلوب"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSetupScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const logOut = useAuthStore((s) => s.logout);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      city: "",
      street: "",
      building: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setSubmitError(null);

      const customer = await createCustomerProfile({
        full_name: data.full_name.trim(),
        address_details: {
          city: data.city.trim(),
          street: data.street.trim(),
          building: data.building.trim(),
          coordinates: { lat: 0, lng: 0 },
        },
      });

      setUser(customer);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      console.error("Profile setup failed:", err);
      setSubmitError("تعذر حفظ البيانات، يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View className="w-full pb-6 pt-4">
        <Text className="text-right text-2xl font-bold text-text-main">
          إعداد الملف الشخصي
        </Text>
        <Text className="mb-6 mt-2 text-right text-base text-text-muted">
          أكمل بياناتك لتتمكن من طلب التوصيل بسهولة
        </Text>

        <Controller
          control={control}
          name="full_name"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              label="الاسم الكامل"
              placeholder="ادخل اسمك الكامل"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={error?.message}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={control}
          name="city"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              label="المدينة"
              placeholder="مثال: القاهرة"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="street"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              label="الشارع"
              placeholder="اسم الشارع"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="building"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              label="المبنى"
              placeholder="رقم أو اسم المبنى"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={error?.message}
            />
          )}
        />

        {submitError && (
          <Text className="mb-2 text-right text-xs font-medium text-error">
            {submitError}
          </Text>
        )}

        <Button
          title="تأكيد"
          onPress={() => {
            Keyboard.dismiss();
            handleSubmit(onSubmit)();
          }}
          disabled={!isValid || isLoading}
          isLoading={isLoading}
          className="mt-2 w-full"
        />
        <Button
          title="سجيل خروج "
          onPress={async () => {
            await logOut();
            router.replace("/");
          }}
          className="mt-2 w-full"
        />
      </View>
    </ScreenWrapper>
  );
}
