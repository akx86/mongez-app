import { db } from "@/services/firebase";
import { CreateOrderPayload } from "@/types/api.types";
import { Item, OrderStatus } from "@/types/schema.types";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";

interface CreateOrderInFirestoreParams {
  payload: CreateOrderPayload;
  customerId: string;
  deliveryFee: number;
}

export async function createOrderInFirestore({
  payload,
  customerId,
  deliveryFee,
}: CreateOrderInFirestoreParams): Promise<string> {
  const vendorSnap = await getDoc(doc(db, "vendors", payload.vendor_id));
  const vendorData = vendorSnap.exists() ? vendorSnap.data() : null;
  const vendorName = (vendorData?.name as string) ?? "متجر";

  const items: Item[] = payload.items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const itemsTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const grandTotal = itemsTotal + deliveryFee;
  const now = new Date().toISOString();

  const orderDoc = await addDoc(collection(db, "orders"), {
    vendor_id: payload.vendor_id,
    vendor_name: vendorName,
    vendor_type: "restaurant",
    status: "pending" satisfies OrderStatus,
    payment_method: payload.payment_method,
    items_total: itemsTotal,
    grand_total: grandTotal,
    delivery_fee: deliveryFee,
    customer_id: customerId,
    app_commission: 0,
    delivery_address: payload.delivery_address,
    distance_km: 0,
    items,
    is_deleted: false,
    created_at: now,
    updated_at: now,
  });

  return orderDoc.id;
}
