import { createCustomerProfile } from "@/api/customers/mutations";
import { ScreenWrapper } from "@/components/layouts/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@store/auth.store";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Keyboard, Text, View } from "react-native";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      setSubmitError(null);
      if (fullName.trim().length < 3) {
        setNameError("الاسم يجب أن يكون 3 أحرف على الأقل");
        return;
      }
      const customer = await createCustomerProfile({
        full_name: fullName.trim(),
        role: "customer",
      });

      setUser(customer);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      console.error("Profile setup failed:", err);
      setNameError("");
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

        <Input
          label="الاسم الكامل"
          placeholder="ادخل اسمك الكامل"
          onChangeText={setFullName}
          value={fullName}
          error={nameError || undefined}
          autoCapitalize="words"
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
            onSubmit();
          }}
          disabled={isLoading}
          isLoading={isLoading}
          className="mt-2 w-full"
        />
      </View>
    </ScreenWrapper>
  );
}
