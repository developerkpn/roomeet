"use client";

import axios from "@/lib/axios";
import { useAuthStore } from "@/lib/store/useAuthStore";

export const useRefreshToken = () => {
  const setAccessToken = useAuthStore((state: any) => state.setAccessToken);

  const refreshToken = async () => {
    console.log("[RefreshToken] Attempting to refresh access token...");
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_APPURL}/user/refreshtoken`,
        {},
        { withCredentials: true }
      );
      if (res?.data?.accessToken) {
        setAccessToken(res.data.accessToken);
        console.log("[RefreshToken] Success. New access token set.");
        console.log(res.data.accessToken, "res.data.accessToken");
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
