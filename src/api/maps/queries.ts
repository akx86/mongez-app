import { ApiResponse } from "@/types/api.types";
import { apiClient } from "@api/client";
import { useQuery } from "@tanstack/react-query";

export interface ReverseGeocodeResult {
  city: string;
  street: string;
  full_address: string;
}

interface GeocodeApiData {
  city?: string;
  street?: string;
  full_address?: string;
  formatted_address?: string;
  place_id?: string;
}

export const mapKeys = {
  all: ["maps"] as const,
  geocode: (lat: number, lng: number) =>
    [...mapKeys.all, "geocode", lat, lng] as const,
};

const fetchReverseGeocode = async (
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult> => {
  const { data } = await apiClient.get<ApiResponse<GeocodeApiData>>(
    "/maps/geocode",
    { params: { lat, lng } },
  );

  const payload = data.data;

  return {
    city: payload.city ?? "",
    street: payload.street ?? "",
    full_address:
      payload.full_address ?? payload.formatted_address ?? "عنوان غير متاح",
  };
};

export const useReverseGeocode = (
  lat: number | null,
  lng: number | null,
) => {
  return useQuery({
    queryKey: mapKeys.geocode(lat ?? 0, lng ?? 0),
    queryFn: () => fetchReverseGeocode(lat!, lng!),
    enabled: lat !== null && lng !== null,
    staleTime: 1000 * 60 * 5,
  });
};
