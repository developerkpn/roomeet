import axios from "@/lib/axios";
import { useAuthStore } from "@/lib/store/auth";
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
          !prevRequest?._retry
        ) {
          prevRequest._retry = true;
          try {
            await refreshToken();
            // Get the new access token from Zustand
            const newAccessToken = useAuthStore.getState().accessToken;
            if (newAccessToken) {
              prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
              return axios(prevRequest);
            } else {
              // No new token received, clear auth and redirect
              clearAuth();
              router.replace("/login");
              return Promise.reject(new Error("No access token after refresh"));
            }
          } catch (refreshError) {
            // Refresh failed, clear auth and redirect
            clearAuth();
            router.replace("/login");
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
