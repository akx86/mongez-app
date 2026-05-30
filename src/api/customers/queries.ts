import { ApiResponse } from "@/types/api.types";
import { Customer } from "@/types/schema.types";
import { apiClient } from "../client";

export async function getCurrentCustomer(): Promise<Customer> {
  const { data } = await apiClient.post<ApiResponse<Customer>>("/auth/login");
  return data.data;
}
