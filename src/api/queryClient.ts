// src/api/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 دقايق cache
      retry: 2,
      refetchOnWindowFocus: false, // مش بيعمل refetch كل ما ترجع للـ app
    },
    mutations: {
      retry: false,
    },
  },
});
