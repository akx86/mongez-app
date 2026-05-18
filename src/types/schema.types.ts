// src/types/schema.types.ts

// 1. الأنواع المشتركة والأساسية
export type UserRole = "admin" | "driver" | "customer";
export type DriverStatus = "pending" | "active" | "rejected" | "suspended";
export type PaymentMethod = "cash" | "visa";

export interface Address {
  city: string;
  street: string;
  building: string;
  floor?: string;
  apartment?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface BaseEntity {
  id: string;
  is_deleted: boolean;
  created_at?: string; // ⚠️ تم تحويلها لـ string عشان الـ JSON من الـ API
  updated_at: string;
}

// 2. أنواع المستخدمين
export interface BaseUser extends BaseEntity {
  full_name: string;
  phone: string;
  role: UserRole;
  is_blocked: boolean;
  fcm_token?: string;
}

export interface Customer extends BaseUser {
  address_details: Address;
  role: "customer";
  has_used_free_delivery: boolean;
  fake_orders_count: number;
}

// 3. المنتجات والأقسام
export interface Product extends BaseEntity {
  vendor_id: string;
  vendor_name: string;
  vendor_logo?: string;
  section_id: string;
  is_available: boolean;
  is_returnable: boolean;
  image_url: string;
  name: string;
  price: number;
}

// 4. الطلبات والسلة
export type OrderStatus =
  | "pending"
  | "driver_accepted"
  | "preparing"
  | "picked_at"
  | "delivering"
  | "completed"
  | "cancelled";

// ⚠️ ده الكيان اللي هنستخدمه في الـ CartStore بدل OrderItem القديم
export interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order extends BaseEntity {
  vendor_name: string;
  vendor_id: string;
  vendor_type: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  items_total: number;
  grand_total: number;
  driver_id?: string;
  delivery_fee: number;
  customer_id: string;
  app_commission: number;
  delivery_address: Address;
  distance_km: number;
  items: Item[];
  driver_accepted_at?: string;
  ready_for_pickup_at?: string;
  completed_at?: string;
  picked_at?: string;
  prepared_at?: string;
}
