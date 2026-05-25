import { ApiResponse } from "@/types/api.types";
import { Address, Customer } from "@/types/schema.types";
import { apiClient } from "@api/client";

export interface CreateCustomerPayload {
  full_name: string;
  role: "customer";
  address_details?: Address;
}

export async function createCustomerProfile(
  payload: CreateCustomerPayload,
): Promise<Customer> {
  const { data } = await apiClient.post<ApiResponse<Customer>>(
    "/auth/register",
    payload,
  );
  return data.data;
}
