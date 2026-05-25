// src/api/client.ts
import { config } from "@constants/config";
import { auth } from "@services/firebase";
import axios from "axios";
export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
export const setupAxiosInterceptors = (onUnauthorized: () => void) => {
  apiClient.interceptors.request.use(async (req) => {
    const token = await auth.currentUser?.getIdToken();

    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  apiClient.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        onUnauthorized();
      }
      return Promise.reject(error);
    },
  );
};
