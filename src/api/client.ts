// src/api/client.ts
import { config } from "@constants/config";
import { auth } from "@services/firebase";
import { useAuthStore } from "@store/auth.store";
import axios from "axios";

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ✅ بيضيف الـ Token تلقائياً في كل request
apiClient.interceptors.request.use(async (req) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ✅ بيتعامل مع الـ Errors بشكل موحد
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) useAuthStore.getState().logout();
    return Promise.reject(error);
  },
);
