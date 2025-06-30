import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserInfo {
  id?: string;
  name?: string;
  email?: string;
  username?: string;
  role_id?: string;
  [key: string]: any;
}

interface AuthState {
  accessToken: string | null;
  user: UserInfo | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: UserInfo | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAccessToken: (token: string | null) => set({ accessToken: token }),
      setUser: (user: UserInfo | null) => set({ user }),
      clearAuth: () => set({ accessToken: null, user: null }),
    }),
    { name: "auth-storage" }
  )
);
