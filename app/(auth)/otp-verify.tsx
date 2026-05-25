import { ScreenWrapper } from "@/components/layouts/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { auth } from "@/services/firebase";
import { colors, fontFamily } from "@constants/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getAdditionalUserInfo,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, Text, View } from "react-native";
import { z } from "zod";

const otpSchema = z.object({
  code: z
    .string()
    .length(6, "كود التحقق يجب أن يكون 6 أرقام")
    .regex(/^\d{6}$/, "كود التحقق يجب أن يكون 6 أرقام"),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function OtpVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    verificationId: string;
    phone: string;
  }>();
  const verificationId = Array.isArray(params.verificationId)
    ? params.verificationId[0]
    : params.verificationId;
  const phone = Array.isArray(params.phone) ? params.phone[0] : params.phone;

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: OtpFormData) => {
    if (!verificationId) {
      setSubmitError("انتهت صلاحية الجلسة، يرجى إعادة إرسال الرمز");
      return;
    }

    try {
      setIsLoading(true);
      setSubmitError(null);

      const credential = PhoneAuthProvider.credential(
        verificationId,
        data.code,
      );
      const userCredential = await signInWithCredential(auth, credential);
      const isNewUser = getAdditionalUserInfo(userCredential)?.isNewUser;

      if (isNewUser) {
        router.replace("/(auth)/profile-setup");
      } else {
        router.replace("/(auth)/profile-setup");
      }
    } catch (err: unknown) {
      console.error("Invalid OTP:", err);
      setSubmitError("كود التحقق غير صحيح، يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable centerContent>
      <View className="w-full pb-4">
        <Text className="text-right text-2xl font-bold text-text-main">
          تأكيد الرمز
        </Text>
        <Text className="mb-8 mt-2 text-right text-base text-text-muted">
          أدخل الكود المرسل إلى الرقم {phone ?? "—"}
        </Text>

        <Controller
          control={control}
          name="code"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <Input
              label="كود التحقق"
              placeholder="000000"
              keyboardType="number-pad"
              autoFocus
              maxLength={6}
              inputContainerClassName="h-[60px]"
              inputClassName="text-center text-2xl font-bold"
              onChangeText={(text) => {
                setSubmitError(null);
                onChange(text.replace(/\D/g, ""));
              }}
              onBlur={onBlur}
              value={value}
              error={error?.message ?? submitError ?? undefined}
              style={{
                color: colors.text.main,
                fontFamily: fontFamily.bold,
                fontSize: 28,
                lineHeight: 34,
                letterSpacing: 8,
                paddingVertical: 0,
              }}
              selectionColor={colors.primary.light}
              cursorColor={colors.primary.default}
            />
          )}
        />

        <Button
          title="تأكيد"
          onPress={() => {
            Keyboard.dismiss();
            handleSubmit(onSubmit)();
          }}
          disabled={!isValid || isLoading || !verificationId}
          isLoading={isLoading}
          className="mt-4 w-full"
        />
      </View>
    </ScreenWrapper>
  );
}
