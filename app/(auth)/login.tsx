import { ScreenWrapper } from "@/components/layouts/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { app, auth } from "@/services/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { useRouter } from "expo-router";
import { PhoneAuthProvider } from "firebase/auth";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, Text, View } from "react-native";
import { z } from "zod";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "رقم الهاتف مطلوب")
    .regex(/^01[0125][0-9]{8}$/, "برجاء إدخال رقم هاتف مصري صحيح"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: PhoneFormData) => {
    try {
      setIsLoading(true);
      const phoneProvider = new PhoneAuthProvider(auth);
      const phoneNumber = `+2${data.phone}`;

      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current!,
      );

      router.push({
        pathname: "/(auth)/otp-verify",
        params: { verificationId, phone: data.phone },
      });
    } catch (err: unknown) {
      console.error("Error sending SMS:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification
      />

      <ScreenWrapper scrollable centerContent>
        <View className="w-full pb-4">
          <Text className="text-right text-2xl font-bold text-text-main">
            تسجيل الدخول
          </Text>
          <Text className="mb-8 mt-2 text-right text-base text-text-muted">
            أدخل رقم هاتفك وسنرسل لك رمز التحقق
          </Text>

          <Controller
            control={control}
            name="phone"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="رقم الهاتف"
                placeholder="01xxxxxxxxx"
                keyboardType="phone-pad"
                autoFocus
                maxLength={11}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={error?.message}
              />
            )}
          />

          <Button
            title="إرسال"
            onPress={() => {
              Keyboard.dismiss();
              handleSubmit(onSubmit)();
            }}
            disabled={!isValid || isLoading}
            isLoading={isLoading}
            className="mt-4 w-full"
          />
        </View>
      </ScreenWrapper>
    </>
  );
}
