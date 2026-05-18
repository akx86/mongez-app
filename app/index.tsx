import { colors } from "@constants/theme";
import { useAuthStore } from "@store/auth.store";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary.default} size="large" />
      </View>
    );
  }

  return <Redirect href="/(tabs)" />;
}
