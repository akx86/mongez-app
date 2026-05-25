import { ScreenWrapper } from "@/components/layouts/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View className="flex-1">
        <View className="flex-1 items-center justify-center">
          <Image
            source={require("../../assets/images/logo.png")}
            className="h-80 w-90"
            resizeMode="contain"
            accessibilityLabel="منجز"
          />
          <Text className="mt-4 text-center text-2xl font-bold text-text-muted">
            أسرع توصيل لطلباتك في أي وقت
          </Text>
        </View>

        <View className="mt-auto w-full pb-2">
          <Button
            title="ابدأ الآن"
            onPress={() => router.push("/(auth)/login")}
            className="w-full"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
