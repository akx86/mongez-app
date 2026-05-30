import { ApiResponse } from "@/types/api.types";
import { Address, Customer } from "@/types/schema.types";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@api/client";
import { useMutation } from "@tanstack/react-query";

export interface CreateCustomerPayload {
  full_name: string;
  role: "customer";
  address_details?: Address;
}

export interface UpdateAddressPayload {
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

export async function createCustomerProfile(
  payload: CreateCustomerPayload,
): Promise<Customer> {
  const { data } = await apiClient.post<ApiResponse<Customer>>(
    "/auth/register",
    payload,
  );
  return data.data;
}

export async function updateCustomerAddress(
  payload: UpdateAddressPayload,
): Promise<Customer> {
  const { data } = await apiClient.put<ApiResponse<Customer>>(
    "/customers/address",
    payload,
  );
  return data.data;
}

export const useUpdateAddressMutation = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: updateCustomerAddress,
    onSuccess: (customer) => {
      setUser(customer);
    },
  });
};
