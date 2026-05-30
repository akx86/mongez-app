import { useActiveBanners } from "@/api/banners/queries";
import { useAuthStore } from "@/store/auth.store";
import { Banner } from "@/types/schema.types";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useMemo } from "react";

export const useHomeBanners = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: fetchedBanners, isLoading, isError } = useActiveBanners();

  // البانر الافتراضي لأول أوردر، واخد نفس شكل الـ Banner في الداتا بيز
  const freeOrderBanner: Banner = {
    id: "default-free-order",
    title: "أول أوردر مجاني",
    subtitle: "",
    button_text: "",
    bg_color: "",
    image_url: "https://i.imgur.com/K3X6W0U.png", // حط لينك تصميم البانر هنا
    is_active: true,
    order: 0,
    action_type: "navigate_domain",
    action_payload: "restaurants_domain_id", // حط الـ ID الحقيقي لقسم المطاعم
    is_deleted: false,
    updated_at: new Date().toISOString(),
  };

  const finalBanners = useMemo(() => {
    let bannersToDisplay = fetchedBanners ? [...fetchedBanners] : [];

    // التشيك على الحقل الحقيقي المطابق للباك إند
    const isEligibleForFreeOrder =
      !user || user.has_used_free_delivery !== true;

    if (isEligibleForFreeOrder) {
      bannersToDisplay = [freeOrderBanner, ...bannersToDisplay];
    }

    return bannersToDisplay;
  }, [fetchedBanners, user]);

  const handleAction = (banner: Banner) => {
    if (!banner.action_type || banner.action_type === "none") return;

    switch (banner.action_type) {
      case "navigate_domain":
        if (banner.action_payload) {
          router.push({
            pathname: "/(main)/category/[id]" as any,
            params: { id: banner.action_payload },
          });
        }
        break;
      case "navigate_vendor":
        if (banner.action_payload) {
          router.push({
            pathname: "/(main)/vendor/[id]" as any,
            params: { id: banner.action_payload },
          });
        }
        break;
      case "external_url":
        if (banner.action_payload) {
          Linking.openURL(banner.action_payload);
        }
        break;
    }
  };

  return { banners: finalBanners, isLoading, isError, handleAction };
};
