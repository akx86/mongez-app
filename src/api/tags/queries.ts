import { db } from "@/services/firebase";
import { Tag } from "@/types/schema.types";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";

export const tagKeys = {
  all: ["tags"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  byDomain: (domainId: string) =>
    [...tagKeys.lists(), { domainId }] as const,
};

const fetchDomainTags = async (domainId: string): Promise<Tag[]> => {
  const tagsRef = collection(db, "tags");

  const q = query(tagsRef, where("domain_id", "==", domainId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Tag[];
};

export const useDomainTags = (domainId: string) => {
  return useQuery({
    queryKey: tagKeys.byDomain(domainId),
    queryFn: () => fetchDomainTags(domainId),
    enabled: !!domainId,
    staleTime: 1000 * 60 * 30,
  });
};
