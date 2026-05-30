import { useRouter } from "expo-router";
// بنستدعي نفس الكويري بتاعة الأقسام لأنك طلبت تعرض فيها الدومينز
import { useActiveDomains } from "@/api/domains/queries";
import { Domain } from "@/types/schema.types";

export const useNearestDomains = () => {
  const router = useRouter();
  const { data: domains, isLoading, isError } = useActiveDomains();

  const handleDomainPress = (domain: Domain) => {
    router.push({
      pathname: "/(main)/domain/[id]" as any,
      params: { id: domain.id, title: domain.name },
    });
  };

  return {
    domains: domains || [],
    isLoading,
    isError,
    handleDomainPress,
  };
};
