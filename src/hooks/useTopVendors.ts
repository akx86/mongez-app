import { useRouter } from "expo-router";
// استيراد الكويري اللي إنت لسه باعتها
import { useTopVendorsQuery } from "@/api/vendors/queries";
import { Vendor } from "@/types/schema.types";

export const useTopVendors = (domainId?: string) => {
  const router = useRouter();

  const { data: vendors, isLoading, isError } = useTopVendorsQuery(domainId);

  // بنصنع دالة التوجيه هنا عشان الواجهة متكونش زحمة
  const handleVendorPress = (vendor: Vendor) => {
    router.push({
      pathname: "/(main)/vendor/[id]" as any,
      params: { id: vendor.id, name: vendor.name },
    });
  };

  // بنصدر كل حاجة جاهزة ومقشرة للواجهة
  return {
    vendors: vendors || [],
    isLoading,
    isError,
    handleVendorPress, // أهي الدالة اللي بتسأل عليها ظهرت هنا
  };
};
