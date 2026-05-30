import { db } from "@/services/firebase";
import { Vendor } from "@/types/schema.types";
import { useQuery } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export const vendorKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorKeys.all, "list"] as const,
  topRated: () => [...vendorKeys.lists(), "top-rated"] as const,
};

const fetchTopVendors = async (): Promise<Vendor[]> => {
  try {
    const vendorsRef = collection(db, "vendors");

    // 🔥 كويري حقيقية: بتجيب المطاعم المفتوحة وترتبهم بالأعلى تقييماً
    const q = query(
      vendorsRef,
      where("is_open", "==", true),
      orderBy("rating", "desc"),
      limit(5),
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vendor[];
  } catch (error: any) {
    console.error("🔥 Raw Firebase Error in Top Vendors:", error.message);
    throw error;
  }
};

export const useTopVendorsQuery = () => {
  return useQuery({
    queryKey: vendorKeys.topRated(),
    queryFn: fetchTopVendors,
    staleTime: 1000 * 60 * 15,
  });
};
