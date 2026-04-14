import apiClient from "../apiClient";

export interface MerchItem {
  _id: string;
  name: string;
  type: string;
  imageUrl: string;
  price: number;
  stock: number;
  createdAt?: string;
}

export interface CreateMerchRequest {
  name: string;
  type: string;
  imageUrl: string;
  price: number;
  stock: number;
}

export const merchApi = {
  getAll: () => apiClient.get<MerchItem[]>("/api/merch"),

  getOne: (id: string) => apiClient.get<MerchItem>(`/api/merch/${id}`),

  create: (data: CreateMerchRequest) =>
    apiClient.post<MerchItem>("/api/merch", data),

  updateStock: (id: string, stock: number) =>
    apiClient.patch<MerchItem>(`/api/merch/${id}/stock`, { stock }),

  delete: (id: string) => apiClient.delete(`/api/merch/${id}`),
};
