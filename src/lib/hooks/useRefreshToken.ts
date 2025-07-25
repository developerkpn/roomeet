"use client";

import axios from "axios";
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
        return res.data.accessToken; // Return the token like working code
      } else {
        console.warn("[RefreshToken] No access token returned.");
        throw new Error("No access token returned");
      }
    } catch (error) {
      setAccessToken(null);
      console.error("[RefreshToken] Failed to refresh access token:", error);
      setTimeout(() => {
        window.location.replace("/login");
      }, 100);
      throw error; // Still throw for interceptor to handle
    }
  };

  return refreshToken;
};
