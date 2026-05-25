import { Customer } from "@/types/schema.types";
import { apiClient } from "@api/client";

export interface CreateCustomerPayload {
  full_name: string;
  address_details: {
    city: string;
    street: string;
    building: string;
    coordinates: { lat: number; lng: number };
  };
}

export async function createCustomerProfile(
  payload: CreateCustomerPayload,
): Promise<Customer> {
  const { data } = await apiClient.post<Customer>("/register", payload);
  return data;
}
