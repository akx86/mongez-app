import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/theme";
import { useAuthStore } from "@/store/auth.store";
import { Address } from "@/types/schema.types";
import { useRouter } from "expo-router";
import { LogOut, MapPin, Pencil, User } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const APP_VERSION = "Mongez v1.0.0";

const formatAddressLine = (address: Address): string => {
  const parts = [address.city, address.street, `مبنى ${address.building}`];
  if (address.floor) parts.push(`الدور ${address.floor}`);
  if (address.apartment) parts.push(`شقة ${address.apartment}`);
  return parts.join("، ");
};

const getInitial = (name: string): string => {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "؟";
};

interface GuestProfileStateProps {
  onLogin: () => void;
}

const GuestProfileState = ({ onLogin }: GuestProfileStateProps) => (
  <View className="flex-1 px-4 justify-center items-center">
    <View
      className="w-24 h-24 rounded-full items-center justify-center mb-6"
      style={{ backgroundColor: colors.gray[100] }}
    >
      <User size={44} color={colors.text.muted} />
    </View>
    <Text className="text-text-main font-bold text-xl text-center mb-2">
      قم بتسجيل الدخول للتحكم في حسابك
    </Text>
    <Text className="text-text-muted text-base text-center mb-8 leading-6">
      أدر عنوان التوصيل، تابع طلباتك، واستمتع بتجربة مخصصة.
    </Text>
    <Button title="تسجيل الدخول" onPress={onLogin} className="w-full max-w-xs" />
  </View>
);

interface AddressCardProps {
  address: Address | undefined;
  onEdit: () => void;
}

const AddressCard = ({ address, onEdit }: AddressCardProps) => (
  <View
    className="mx-4 mb-4 rounded-2xl border border-gray-100 p-4"
    style={{ backgroundColor: colors.surface }}
  >
    <View className="flex-row-reverse items-center justify-between mb-3">
      <View className="flex-row-reverse items-center gap-x-2 flex-1">
        <MapPin size={18} color={colors.primary.default} />
        <Text className="text-text-main font-bold text-lg text-right">
          عنوان التوصيل
        </Text>
      </View>

      <TouchableOpacity
        onPress={onEdit}
        activeOpacity={0.7}
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.gray[100] }}
      >
        <Pencil size={16} color={colors.text.main} />
      </TouchableOpacity>
    </View>

    {address ? (
      <Text className="text-text-main text-base text-right leading-6">
        {formatAddressLine(address)}
      </Text>
    ) : (
      <Text className="text-text-muted text-base text-right">
        لم يتم حفظ عنوان بعد. أكمل ملفك الشخصي لإضافة عنوان التوصيل.
      </Text>
    )}
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleEditAddress = useCallback(() => {
    Alert.alert("قريباً", "سيتم توفير هذه الميزة قريباً");
  }, []);

  const performLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/(tabs)/index");
    } catch {
      Alert.alert("خطأ", "تعذّر تسجيل الخروج. حاول مرة أخرى.");
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, router]);

  const handleLogoutPress = useCallback(() => {
    Alert.alert(
      "تسجيل الخروج",
      "هل أنت متأكد أنك تريد تسجيل الخروج؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تسجيل الخروج",
          style: "destructive",
          onPress: () => {
            void performLogout();
          },
        },
      ],
    );
  }, [performLogout]);

  if (!user) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        edges={["top", "left", "right"]}
      >
        <View className="px-4 py-4 border-b border-gray-100">
          <Text className="text-text-main font-bold text-2xl text-right">
            حسابي
          </Text>
        </View>
        <GuestProfileState onLogin={() => router.push("/(auth)/login")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="px-4 py-4 border-b border-gray-100 mb-6">
          <Text className="text-text-main font-bold text-2xl text-right">
            حسابي
          </Text>
        </View>

        <View className="items-center px-4 mb-6">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary.default }}
          >
            <Text
              className="font-bold text-4xl"
              style={{ color: colors.text.inverse }}
            >
              {getInitial(user.full_name)}
            </Text>
          </View>

          <Text className="text-text-main font-bold text-xl text-center mb-1">
            {user.full_name}
          </Text>
          <Text className="text-text-muted text-base text-center">
            {user.phone}
          </Text>
        </View>

        <AddressCard address={user.address_details} onEdit={handleEditAddress} />

        <View className="mx-4 mb-6">
          <TouchableOpacity
            onPress={handleLogoutPress}
            activeOpacity={0.85}
            disabled={isLoggingOut}
            className="flex-row-reverse items-center justify-center gap-x-2 py-4 rounded-xl border"
            style={{
              backgroundColor: `${colors.error}10`,
              borderColor: `${colors.error}40`,
              opacity: isLoggingOut ? 0.6 : 1,
            }}
          >
            <LogOut size={20} color={colors.error} />
            <Text
              className="font-bold text-base"
              style={{ color: colors.error }}
            >
              {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-text-muted text-sm text-center">
          {APP_VERSION}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
