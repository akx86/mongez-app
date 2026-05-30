import { useRouter } from "expo-router";
// تأكد من مسار الاستيراد الصحيح للكويري الخاصة بك
import { useActiveDomains } from "@/api/domains/queries";
import { Domain } from "@/types/schema.types"; // نعتمد على Domain من الاسكيما الموحدة

export const useHomeCategories = () => {
  const router = useRouter();

  // استدعاء الداتا الحقيقية
  const { data: domains, isLoading, isError } = useActiveDomains();

  const handleDomainPress = (domain: Domain) => {
    // التوجيه لشاشة القسم وإرسال الـ ID والاسم
    // لاحظ إننا لغينا الـ slug واعتمدنا على الـ id الخاص بالـ Domain مباشرة
    router.push({
      pathname: "/(main)/domain/[id]" as any,
      params: { id: domain.id, title: domain.name },
    });
  };

  return {
    domains: domains || [], // إرجاع مصفوفة فارغة لتجنب أي أخطاء في الـ UI
    isLoading,
    isError,
    handleDomainPress,
  };
};
