import { db } from "@/services/firebase";
import { MenuSection, Product, Vendor } from "@/types/schema.types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
  startAfter,
  where,
} from "firebase/firestore";

export const vendorKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorKeys.all, "list"] as const,
  topRated: (domainId?: string) =>
    [...vendorKeys.lists(), "top-rated", { domainId }] as const,
  domain: (domainId: string, selectedTagId?: string) =>
    [...vendorKeys.lists(), "domain", domainId, { selectedTagId }] as const,
  detail: (vendorId: string) =>
    [...vendorKeys.all, "detail", vendorId] as const,
  menuSections: (vendorId: string) =>
    [...vendorKeys.all, "menu-sections", vendorId] as const,
  products: (vendorId: string) =>
    [...vendorKeys.all, "products", vendorId] as const,
};

export const productKeys = {
  all: ["products"] as const,
  detail: (productId: string) =>
    [...productKeys.all, "detail", productId] as const,
};

const DOMAIN_VENDORS_PAGE_SIZE = 10;

export type DomainVendorsPage = {
  vendors: Vendor[];
  lastDoc: QueryDocumentSnapshot | null;
};

const fetchTopVendors = async (domainId?: string): Promise<Vendor[]> => {
  try {
    const vendorsRef = collection(db, "vendors");

    const constraints: QueryConstraint[] = [where("is_open", "==", true)];

    if (domainId) {
      constraints.push(where("domain_id", "==", domainId));
    }

    constraints.push(orderBy("rating", "desc"), limit(5));

    const q = query(vendorsRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vendor[];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("🔥 Raw Firebase Error in Top Vendors:", message);
    throw error;
  }
};

export const fetchDomainVendors = async ({
  domainId,
  selectedTagId,
  pageParam,
}: {
  domainId: string;
  selectedTagId?: string;
  pageParam?: QueryDocumentSnapshot;
}): Promise<DomainVendorsPage> => {
  const vendorsRef = collection(db, "vendors");

  const constraints: QueryConstraint[] = [
    where("domain_id", "==", domainId),
  ];

  if (selectedTagId) {
    constraints.push(where("tag_ids", "array-contains", selectedTagId));
  }

  constraints.push(orderBy("rating", "desc"));

  if (pageParam) {
    constraints.push(startAfter(pageParam));
  }

  constraints.push(limit(DOMAIN_VENDORS_PAGE_SIZE));

  const q = query(vendorsRef, ...constraints);
  const snapshot = await getDocs(q);

  const vendors = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Vendor[];

  const lastDoc =
    snapshot.docs.length > 0
      ? snapshot.docs[snapshot.docs.length - 1]
      : null;

  return { vendors, lastDoc };
};

export const useTopVendorsQuery = (domainId?: string) => {
  return useQuery({
    queryKey: vendorKeys.topRated(domainId),
    queryFn: () => fetchTopVendors(domainId),
    staleTime: 1000 * 60 * 15,
  });
};

export const useDomainVendors = (
  domainId: string,
  selectedTagId?: string,
) => {
  return useInfiniteQuery({
    queryKey: vendorKeys.domain(domainId, selectedTagId),
    queryFn: ({ pageParam }) =>
      fetchDomainVendors({ domainId, selectedTagId, pageParam }),
    initialPageParam: undefined as QueryDocumentSnapshot | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.vendors.length < DOMAIN_VENDORS_PAGE_SIZE) {
        return undefined;
      }
      return lastPage.lastDoc ?? undefined;
    },
    enabled: !!domainId,
    staleTime: 1000 * 60 * 15,
  });
};

const fetchVendorDetails = async (vendorId: string): Promise<Vendor | null> => {
  const snapshot = await getDoc(doc(db, "vendors", vendorId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Vendor;
};

const fetchVendorMenuSections = async (
  vendorId: string,
): Promise<MenuSection[]> => {
  const sectionsRef = collection(db, "menu_sections");
  const q = query(
    sectionsRef,
    where("vendor_id", "==", vendorId),
    orderBy("sort_order", "asc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as MenuSection[];
};

const fetchVendorProducts = async (vendorId: string): Promise<Product[]> => {
  const productsRef = collection(db, "products");
  const q = query(
    productsRef,
    where("vendor_id", "==", vendorId),
    where("is_available", "==", true),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Product[];
};

export const useVendorDetailsQuery = (vendorId: string) => {
  return useQuery({
    queryKey: vendorKeys.detail(vendorId),
    queryFn: () => fetchVendorDetails(vendorId),
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 15,
  });
};

export const useVendorMenuSectionsQuery = (vendorId: string) => {
  return useQuery({
    queryKey: vendorKeys.menuSections(vendorId),
    queryFn: () => fetchVendorMenuSections(vendorId),
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 15,
  });
};

export const useVendorProductsQuery = (vendorId: string) => {
  return useQuery({
    queryKey: vendorKeys.products(vendorId),
    queryFn: () => fetchVendorProducts(vendorId),
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 15,
  });
};

const fetchProductDetails = async (
  productId: string,
): Promise<Product | null> => {
  const snapshot = await getDoc(doc(db, "products", productId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Product;
};

export const useProductDetailsQuery = (productId: string) => {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => fetchProductDetails(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 15,
  });
};
