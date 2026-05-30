import { db } from "@/services/firebase";
import { Domain } from "@/types/schema.types";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export const domainKeys = {
  all: ["domains"] as const,
  lists: () => [...domainKeys.all, "list"] as const,
  active: () => [...domainKeys.lists(), { filter: "is_active" }] as const,
};

const fetchActiveDomains = async (): Promise<Domain[]> => {
  try {
    const catRef = collection(db, "domains");

    const q = query(
      catRef,
      where("is_active", "==", true),
      orderBy("order", "asc"),
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Domain;
    });
  } catch (error: any) {
    console.error("🔥 Raw Firebase Error:", error.message);
    throw error; // بنرمي الإي
  }
};

export const useActiveDomains = () => {
  return useQuery({
    queryKey: domainKeys.active(),
    queryFn: fetchActiveDomains,

    staleTime: 1000 * 60 * 60 * 72,

    gcTime: 1000 * 60 * 60 * 144,
  });
};
