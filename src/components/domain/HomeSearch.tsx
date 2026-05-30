import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/theme";
import { useHomeSearch } from "@/hooks/useHomeSearch";
import { Search } from "lucide-react-native";
import React from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
export const HomeSearch = () => {
  const { searchText, setSearchText } = useHomeSearch();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="px-4 py-2 bg-background">
        <Input
          value={searchText}
          onChangeText={setSearchText}
          placeholder="بتدور على إيه؟ (مطعم، صيدلية...)"
          returnKeyType="search"
          className="mb-0"
          inputContainerClassName="bg-surface border-gray-200 h-12"
          leftIcon={<Search size={20} color={colors.text.muted} />}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};
