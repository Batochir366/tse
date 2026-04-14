import apiClient from "../apiClient";

export interface Payment {
  _id: string;
  userId: string;
  itemId: string;
  itemType: string;
  amount: number;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  course?: { name: string };
}

export const paymentsApi = {
  createInvoice: (courseId: string) =>
    apiClient.post("/api/payments/invoice", { courseId }),

  checkStatus: (paymentId: string) =>
    apiClient.get(`/api/payments/status/${paymentId}`),

  myPayments: () => apiClient.get<Payment[]>("/api/payments/my"),

  getAll: () => apiClient.get<Payment[]>("/api/payments/all"),
};
