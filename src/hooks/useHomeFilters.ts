import { FilterChip } from "@/types/schema.types";
import { useRouter } from "expo-router";
export const useHomeFilters = () => {
  const router = useRouter();

  const FILTERS: FilterChip[] = [
    {
      id: "all",
      label: "الكل",
      actionType: "stay",
    },
    {
      id: "offers",
      label: "عروض 🔥",
      actionType: "navigate",
      // هيوجه لشاشة الكاتيجوري العامة بس هيبعت بارامتر type=offers عشان نعرض الداتا اللي فيها خصومات
      route: "/(main)/category/[id]",
      params: { id: "offers", title: "العروض الحالية" },
    },
    {
      id: "restaurants",
      label: "أحدث المطاعم",
      actionType: "navigate",
      route: "/(main)/category/[id]",
      params: { id: "restaurants", title: "المطاعم" },
    },
    {
      id: "markets",
      label: "تسوق السوبر ماركت",
      actionType: "navigate",
      route: "/(main)/category/[id]",
      params: { id: "markets", title: "سوبر ماركت" },
    },
  ];

  const handleSelect = (filter: FilterChip) => {
    if (filter.actionType === "stay") {
      // إحنا بالفعل في "الكل" (الرئيسية)، فمفيش أكشن محتاجينه هنا
      return;
    }

    if (filter.actionType === "navigate" && filter.route) {
      // توجيه باستخدام expo-router مع تمرير البارامترات
      router.push({
        pathname: filter.route as any, // as any عشان نتجنب مشاكل الـ strict types في المسارات الديناميكية حاليا
        params: filter.params,
      });
    }
  };

  return {
    filters: FILTERS,
    activeId: "all", // دايما "الكل" هو الـ Active في شاشة الـ Home
    handleSelect,
  };
};
