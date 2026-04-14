"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  authApi,
  type AuthResponse,
  type MeResponse,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/api/auth.api";

interface AuthState {
  user: MeResponse | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const saveAuth = (res: AuthResponse) => {
    localStorage.setItem("accessToken", res.accessToken);
    setUser({
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      courseAccess: [],
    });
  };

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authApi.me();
      setUser(data);
    } catch {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (payload: LoginPayload) => {
    const { data } = await authApi.login(payload);
    saveAuth(data);
    await refreshUser();
  };

  const register = async (payload: RegisterPayload) => {
    const { data } = await authApi.register(payload);
    saveAuth(data);
    await refreshUser();
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
