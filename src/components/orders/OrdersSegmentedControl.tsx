import { colors } from "@/constants/theme";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type OrdersTab = "active" | "past";

interface OrdersSegmentedControlProps {
  activeTab: OrdersTab;
  onTabChange: (tab: OrdersTab) => void;
}

const TABS: { key: OrdersTab; label: string }[] = [
  { key: "active", label: "طلبات حالية" },
  { key: "past", label: "طلبات سابقة" },
];

export const OrdersSegmentedControl = ({
  activeTab,
  onTabChange,
}: OrdersSegmentedControlProps) => (
  <View
    className="mx-4 mb-4 flex-row-reverse rounded-xl p-1 border border-gray-100"
    style={{ backgroundColor: colors.gray[100] }}
  >
    {TABS.map((tab) => {
      const isActive = activeTab === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.85}
          className="flex-1 py-2.5 rounded-lg items-center"
          style={{
            backgroundColor: isActive ? colors.surface : "transparent",
            shadowColor: isActive ? colors.black : "transparent",
            shadowOpacity: isActive ? 0.06 : 0,
            shadowRadius: isActive ? 4 : 0,
            elevation: isActive ? 2 : 0,
          }}
        >
          <Text
            className="font-bold text-sm"
            style={{
              color: isActive ? colors.primary.default : colors.text.muted,
            }}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);
