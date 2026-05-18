// src/components/layouts/ScreenWrapper.tsx
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
}

export function ScreenWrapper({
  children,
  scrollable = false,
  className = "",
}: Props) {
  const content = (
    <View className={`flex-1 bg-background px-4 ${className}`}>{children}</View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
