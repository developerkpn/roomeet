"use client";

import axios from "@/lib/axios";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRefreshToken } from "./useRefreshToken";

const useAxiosAuth = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const refreshToken = useRefreshToken();
  const router = useRouter();

  useEffect(() => {
    const requestIntercept = axios.interceptors.request.use(
      (config) => {
        if (accessToken && !config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        if (
          (error?.response?.status === 401 ||
            error?.response?.status === 403) &&
          !prevRequest?.sent
        ) {
          prevRequest.sent = true; // Use 'sent' flag like working code
          try {
            const newAccessToken = await refreshToken(); // Get token directly
            if (newAccessToken) {
              prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
              return axios(prevRequest);
            } else {
              // No new token received, let refresh handle redirect
              return Promise.reject(new Error("No access token after refresh"));
            }
          } catch (refreshError) {
            // Refresh failed, let refresh handle redirect  
            return Promise.reject(refreshError);
          }
        }
        // For other errors, just reject without redirecting
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.request.eject(requestIntercept);
      axios.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, refreshToken, clearAuth, router]);

  return axios;
};

export default useAxiosAuth;
