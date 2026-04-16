import apiClient from "../apiClient";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export const usersApi = {
  getAll: () => apiClient.get<User[]>("/api/admin/auth/users"),
};
