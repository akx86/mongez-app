import { Customer } from "@/types/schema.types";
import { apiClient } from "../client";

export async function getCurrentCustomer(): Promise<Customer> {
  const { data } = await apiClient.get<Customer>("/register/me");
  return data;
}
