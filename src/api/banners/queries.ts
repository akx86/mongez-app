import { db } from "@/services/firebase";
import { Banner } from "@/types/schema.types";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export const bannerKeys = {
  all: ["banners"] as const,
  lists: () => [...bannerKeys.all, "list"] as const,
  active: () => [...bannerKeys.lists(), { filter: "active" }] as const,
};

const fetchActiveBanners = async (): Promise<Banner[]> => {
  const bannersRef = collection(db, "banners");

  const q = query(
    bannersRef,
    where("is_active", "==", true),
    orderBy("order", "asc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    } as Banner;
  });
};

export const useActiveBanners = () => {
  return useQuery({
    queryKey: bannerKeys.active(),
    queryFn: fetchActiveBanners,

    staleTime: 1000 * 60 * 60 * 24,

    gcTime: 1000 * 60 * 60 * 48,
  });
};
