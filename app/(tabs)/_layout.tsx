import { colors } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface Tab {
  name: string;
  title: string;
  icon: IoniconsName;
  activeIcon: IoniconsName;
}

const TABS: Tab[] = [
  {
    name: "index",
    title: "الرئيسية",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "cart", // أضف هذا الملف
    title: "عربتي",
    icon: "cart-outline",
    activeIcon: "cart",
  },
  {
    name: "notifications", // أضف هذا الملف
    title: "الإشعارات",
    icon: "notifications-outline",
    activeIcon: "notifications",
  },
  {
    name: "profile",
    title: "حسابي",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.default,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.gray[100],
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
      }}
    >
      {TABS.map(({ name, title, icon, activeIcon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? activeIcon : icon}
                color={color}
                size={24}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
