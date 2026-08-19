import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        if (typeof document !== "undefined") {
          document.cookie = `unblock_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
        }
        set({ user, token, isAuthenticated: true });
      },
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (typeof document !== "undefined") {
          if (token) {
            document.cookie = `unblock_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
          } else {
            document.cookie = `unblock_token=; path=/; max-age=0; SameSite=Lax`;
          }
        }
        set({ token });
      },
      logout: () => {
        if (typeof document !== "undefined") {
          document.cookie = `unblock_token=; path=/; max-age=0; SameSite=Lax`;
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "unblock-auth-storage",
    }
  )
);
