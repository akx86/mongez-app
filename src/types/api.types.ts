export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

/** POST /api/orders request body (V4 architecture) */
export interface CreateOrderItemPayload {
  id: string;
  quantity: number;
  price: number;
  name: string;
}

export interface CreateOrderPayload {
  vendor_id: string;
  payment_method: "cash" | "visa";
  items: CreateOrderItemPayload[];
  delivery_address: {
    city: string;
    street: string;
    building: string;
    floor?: string;
    apartment?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}
