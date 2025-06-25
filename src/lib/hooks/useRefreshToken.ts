"use client";

import { useAuthStore } from "@/lib/store/auth";
import axios from "../axios";

export const useRefreshToken = () => {
  const setAccessToken = useAuthStore((state: any) => state.setAccessToken);

  const refreshToken = async () => {
    console.log("[RefreshToken] Attempting to refresh access token...");
    try {
      const res = await axios.post(
        "/user/refreshtoken",
        {},
        { withCredentials: true }
      );
      if (res?.data?.accessToken) {
        setAccessToken(res.data.accessToken);
        console.log("[RefreshToken] Success. New access token set.");
      } else {
        console.warn("[RefreshToken] No access token returned.");
      }
    } catch (error) {
      setAccessToken(null);
      console.error("[RefreshToken] Failed to refresh access token:", error);
    }
  };

  return refreshToken;
};
