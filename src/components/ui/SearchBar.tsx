import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
}

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = "ابحث عن مطعم، صيدلية، أو وجبة...",
  onSubmitEditing,
}: SearchBarProps) => {
  return (
    <View
      style={{ backgroundColor: colors.surface, borderColor: colors.gray[200] }}
      className="flex-row items-center rounded-xl px-3 py-2 border"
    >
      <Ionicons name="search" size={20} color={colors.text.muted} />

      <TextInput
        className="flex-1 px-2 text-base text-right"
        style={{ color: colors.text.main }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
        textAlign="right"
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")} className="p-1">
          <Ionicons name="close-circle" size={20} color={colors.text.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
};
