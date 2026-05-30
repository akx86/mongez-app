import { db } from "@/services/firebase";
import { Banner } from "@/types/schema.types";
import { useQuery } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  orderBy,
  query,
  QueryConstraint,
  where,
} from "firebase/firestore";

export const bannerKeys = {
  all: ["banners"] as const,
  lists: () => [...bannerKeys.all, "list"] as const,
  active: (domainId?: string) =>
    [...bannerKeys.lists(), { filter: "active", domainId }] as const,
};

const fetchActiveBanners = async (domainId?: string): Promise<Banner[]> => {
  const bannersRef = collection(db, "banners");

  const constraints: QueryConstraint[] = [
    where("is_active", "==", true),
  ];

  if (domainId) {
    constraints.push(where("domain_id", "==", domainId));
  }

  constraints.push(orderBy("order", "asc"));

  const q = query(bannersRef, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    } as Banner;
  });
};

export const useActiveBanners = (domainId?: string) => {
  return useQuery({
    queryKey: bannerKeys.active(domainId),
    queryFn: () => fetchActiveBanners(domainId),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 48,
  });
};
