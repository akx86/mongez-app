// src/components/layouts/ScreenWrapper.tsx
import { ScrollView, View, useWindowDimensions } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
  /** يوسّط المحتوى عموديًا عند الإغلاق، مع إمكانية السكرول عند فتح الكيبورد */
  centerContent?: boolean;
}

export function ScreenWrapper({
  children,
  scrollable = false,
  className = "",
  centerContent = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const content = (
    <View className={`bg-background px-4 ${scrollable ? "w-full" : "flex-1"} ${className}`}>
      {children}
    </View>
  );

  if (!scrollable) {
    return (
      <SafeAreaView className="flex-1 bg-background">{content}</SafeAreaView>
    );
  }

  const minContentHeight = windowHeight - insets.top - insets.bottom;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{
          flexGrow: 1,
          minHeight: centerContent ? minContentHeight : undefined,
          justifyContent: centerContent ? "center" : undefined,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}
