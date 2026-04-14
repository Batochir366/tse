import apiClient from "../apiClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken?: string;
  data?: {
    accessToken: string;
    admin: AdminInfo;
  };
  admin?: AdminInfo;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>("/api/admin/auth/login", data),

  me: () => apiClient.get<AdminInfo>("/api/admin/auth/me"),

  logout: () => apiClient.post("/api/admin/auth/logout"),
};
