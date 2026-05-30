import { HomeBanners } from "@/components/domain/HomeBanners";
import { HomeDomains } from "@/components/domain/HomeDomains";
import { HomeFilters } from "@/components/domain/HomeFilters";
import { HomeHeader } from "@/components/domain/HomeHeader";
import { HomeSearch } from "@/components/domain/HomeSearch";
import { NearestDomains } from "@/components/domain/NearestDomains";
import { TopVendors } from "@/components/domain/TopVendors";
import { ScreenWrapper } from "@/components/layouts/ScreenWrapper";
import React from "react";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  return (
    <ScreenWrapper>
      {/* 1. الجزء الثابت (Sticky): الهيدر والبحث بيفضلوا ظاهرين دايماً */}
      <View className="z-10 bg-background pb-2">
        <HomeHeader />
        <HomeSearch />
      </View>

      {/* 2. الجزء المتحرك (Scrollable): باقي محتوى الصفحة */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100, // مساحة أمان تحت عشان الـ Bottom Tab Bar ميغطيش على آخر سكشن
          paddingTop: 8,
          gap: 16, // مسافات موحدة بين السكاشن
        }}
      >
        <HomeFilters />
        <HomeBanners />
        <HomeDomains />
        <TopVendors />
        <NearestDomains />
      </ScrollView>
    </ScreenWrapper>
  );
}
