import apiClient from "../apiClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: { id: string; name: string; email: string };
  accessToken: string;
}

export interface MeResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  courseAccess: {
    courseId: string;
    expiresAt: string;
    reminder7dSentAt?: string;
  }[];
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post<AuthResponse>("/api/auth/register", data),

  login: (data: LoginPayload) =>
    apiClient.post<AuthResponse>("/api/auth/login", data),

  me: () => apiClient.get<MeResponse>("/api/auth/me"),

  refresh: () => apiClient.post<{ accessToken: string }>("/api/auth/refresh"),

  logout: () => apiClient.post("/api/auth/logout"),

  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>("/api/auth/forgot-password", { email }),

  verifyOtp: (email: string, otp: string) =>
    apiClient.post<{ message: string; resetToken: string }>(
      "/api/auth/verify-otp",
      { email, otp },
    ),

  resetPassword: (resetToken: string, newPassword: string) =>
    apiClient.post<{ message: string }>("/api/auth/reset-password", {
      resetToken,
      newPassword,
    }),

  patchMe: (data: { name?: string; phone?: string }) =>
    apiClient.patch<MeResponse>("/api/auth/me", data),

  requestChangePasswordOtp: () =>
    apiClient.post<{ message: string }>(
      "/api/auth/change-password/request-otp",
    ),

  confirmChangePassword: (data: { otp: string; newPassword: string }) =>
    apiClient.post<{ message: string }>(
      "/api/auth/change-password/confirm",
      data,
    ),

  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return apiClient.post<{ avatar: string }>("/api/auth/avatar", fd);
  },
};
