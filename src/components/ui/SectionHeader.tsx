// src/components/ui/SectionHeader.tsx
import { colors } from "@/constants/theme";
import { Text, TouchableOpacity, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  onPressSeeAll?: () => void;
  showSeeAll?: boolean;
}

export const SectionHeader = ({
  title,
  onPressSeeAll,
  showSeeAll = true,
}: SectionHeaderProps) => {
  return (
    <View className="flex-row items-center justify-between px-4 mb-3">
      <Text
        style={{ color: colors.text.main }}
        className="text-lg font-bold text-right"
      >
        {title}
      </Text>

      {showSeeAll && onPressSeeAll && (
        <TouchableOpacity onPress={onPressSeeAll} activeOpacity={0.7}>
          <Text
            style={{ color: colors.primary.default }}
            className="text-sm font-semibold"
          >
            عرض الكل
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
