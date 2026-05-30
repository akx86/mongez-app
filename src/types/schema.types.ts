// src/types/schema.types.ts

// ==========================================
// 1. الأنواع المشتركة والأساسية (Shared Types)
// ==========================================
export type UserRole = "admin" | "driver" | "customer";
export type DriverStatus = "pending" | "active" | "rejected" | "suspended";
export type PaymentMethod = "cash" | "visa";
export type BannerActionType =
  | "none"
  | "navigate_vendor"
  | "navigate_domain"
  | "external_url";
export type OrderStatus =
  | "pending"
  | "driver_accepted"
  | "preparing"
  | "picked_at"
  | "delivering"
  | "completed"
  | "cancelled";

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

// ملاحظة: لو بتستخدم Firebase Timestamp مباشرة من الـ SDK، ممكن تخلي النوع any أو Timestamp،
// لكن في الـ Frontend المعتاد بنحولها لـ string أو Date. هنسيبها string لتسهيل التعامل في الـ UI.
export interface BaseEntity {
  id: string;
  is_deleted: boolean;
  created_at?: string;
  updated_at: string;
}

// ==========================================
// 2. أنواع المستخدمين (Users)
// ==========================================
export interface BaseUser extends BaseEntity {
  full_name: string;
  phone: string;
  role: UserRole;
  is_blocked: boolean;
  fcm_token?: string;
}

export interface Customer extends BaseUser {
  role: "customer";
  address_details?: Address;
  has_used_free_delivery?: boolean; // أصبحت اختيارية لتطابق الباك إند
  fake_orders_count?: number; // أصبحت اختيارية لتطابق الباك إند
}

export interface Driver extends BaseUser {
  role: "driver";
  status: DriverStatus;
  identity_info: {
    full_name: string;
    national_id: string;
    address_as_in_id: string;
  };
  work_info: {
    work_area: string;
    vehicle_plate: string;
    personal_license_number: string;
    vehicle_type?: string;
  };
  wallet_balance: number;
  vehicle_info: string;
  is_online: boolean;
  current_location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export interface Admin extends BaseUser {
  role: "admin";
  permissions: string[];
}

// ==========================================
// 3. الكيانات الرئيسية (Entities)
// ==========================================

// تم استبدال Category بـ Domain ليتطابق مع الباك إند
export interface Domain extends BaseEntity {
  name: string;
  icon_url: string;
  order: number;
}

export interface Tag extends BaseEntity {
  name: string;
  domain_id: string;
  image_url?: string;
}

export interface Vendor extends BaseEntity {
  name: string;
  domain_id: string;
  tag_ids: string[];
  is_open: boolean;
  cover_url?: string;
  rating: number;
  reviews_count: number;
  delivery_time_min: number;
  delivery_time_max: number;
  delivery_fee: number;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  commission_rate: number;
  logo_url: string;
  wallet_balance: number;
  address_text: string;
}

export interface MenuSection extends BaseEntity {
  vendor_id: string;
  title: string;
  sort_order: number;
}

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

export interface Banner extends BaseEntity {
  title: string;
  subtitle: string;
  button_text: string;
  image_url: string;
  bg_color: string;
  is_active: boolean;
  order: number;
  action_type: BannerActionType;
  action_payload: string | null;
}

// ==========================================
// 4. الطلبات والسلة (Orders & Cart)
// ==========================================
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

// ==========================================
// 5. أنواع خاصة بالواجهة الأمامية (UI Only Types)
// ==========================================
// دي ملهاش علاقة بالداتا بيز، دي عشان ننظم الـ Props والـ States في الـ Components

export interface HomeHeaderProps {
  userName: string | null;
  locationLabel: string;
  onLocationPress: () => void;
}

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  addressLabel: string | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentLocation: () => Promise<void>;
}

export interface FilterChip {
  id: string;
  label: string;
  actionType: "stay" | "navigate";
  route?: string;
  params?: Record<string, string>;
}
