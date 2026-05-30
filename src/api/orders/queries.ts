import { db } from "@/services/firebase";
import {
  ACTIVE_ORDER_STATUSES,
  PAST_ORDER_STATUSES,
} from "@/utils/orderStatus";
import { Order } from "@/types/schema.types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export const orderKeys = {
  all: ["orders"] as const,
  detail: (orderId: string) => [...orderKeys.all, "detail", orderId] as const,
  active: (customerId: string) =>
    [...orderKeys.all, "active", customerId] as const,
  past: (customerId: string) => [...orderKeys.all, "past", customerId] as const,
};

const PAST_ORDERS_PAGE_SIZE = 10;

export type PastOrdersPage = {
  orders: Order[];
  lastDoc: QueryDocumentSnapshot | null;
};

const mapOrderDocs = (
  docs: QueryDocumentSnapshot[],
): Order[] =>
  docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Order[];

const fetchActiveOrders = async (customerId: string): Promise<Order[]> => {
  const ordersRef = collection(db, "orders");
  const q = query(
    ordersRef,
    where("customer_id", "==", customerId),
    where("status", "in", ACTIVE_ORDER_STATUSES),
    orderBy("created_at", "desc"),
  );
  const snapshot = await getDocs(q);
  return mapOrderDocs(snapshot.docs);
};

export const fetchPastOrders = async ({
  customerId,
  pageParam,
}: {
  customerId: string;
  pageParam?: QueryDocumentSnapshot;
}): Promise<PastOrdersPage> => {
  const ordersRef = collection(db, "orders");

  const constraints = [
    where("customer_id", "==", customerId),
    where("status", "in", PAST_ORDER_STATUSES),
    orderBy("created_at", "desc"),
  ];

  if (pageParam) {
    constraints.push(startAfter(pageParam));
  }

  constraints.push(limit(PAST_ORDERS_PAGE_SIZE));

  const q = query(ordersRef, ...constraints);
  const snapshot = await getDocs(q);
  const orders = mapOrderDocs(snapshot.docs);
  const lastDoc =
    snapshot.docs.length > 0
      ? snapshot.docs[snapshot.docs.length - 1]
      : null;

  return { orders, lastDoc };
};

export const useActiveOrders = (customerId: string | undefined) => {
  return useQuery({
    queryKey: orderKeys.active(customerId ?? ""),
    queryFn: () => fetchActiveOrders(customerId!),
    enabled: !!customerId,
    staleTime: 1000 * 60 * 2,
  });
};

export const usePastOrders = (customerId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: orderKeys.past(customerId ?? ""),
    queryFn: ({ pageParam }) =>
      fetchPastOrders({ customerId: customerId!, pageParam }),
    initialPageParam: undefined as QueryDocumentSnapshot | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.orders.length < PAST_ORDERS_PAGE_SIZE) {
        return undefined;
      }
      return lastPage.lastDoc ?? undefined;
    },
    enabled: !!customerId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useOrderTracking = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      setError("معرف الطلب غير صالح");
      return;
    }

    setIsLoading(true);
    setError(null);

    const orderRef = doc(db, "orders", orderId);

    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setOrder(null);
          setError("الطلب غير موجود");
          setIsLoading(false);
          return;
        }

        setOrder({ id: snapshot.id, ...snapshot.data() } as Order);
        setIsLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [orderId]);

  return { order, isLoading, error };
};
