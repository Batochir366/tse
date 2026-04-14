import { authApi, LoginRequest } from "../api/auth.api";

export const authService = {
  login: async (data: LoginRequest) => {
    try {
      const res = await authApi.login(data);
      const body = res.data;
      const token = body.accessToken ?? body.data?.accessToken;
      const admin = body.admin ?? body.data?.admin;
      if (token) {
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminInfo", JSON.stringify(admin));
      }
      return { token, admin };
    } catch (error) {
      console.log("authService.login error", error);
      throw error;
    }
  },

  me: async () => {
    try {
      const res = await authApi.me();
      return res.data;
    } catch (error) {
      console.log("authService.me error", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.log("authService.logout error", error);
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
    }
  },

  getStoredAdmin: () => {
    if (typeof window === "undefined") return null;
    const info = localStorage.getItem("adminInfo");
    return info ? JSON.parse(info) : null;
  },

  getToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("adminToken");
  },
};
