import apiClient from "../apiClient";

export interface Payment {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  itemId: string;
  itemType: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  course?: { _id: string; name: string };
}

export interface PaymentsListPage {
  items: Payment[];
  total: number;
  page: number;
  pageSize: number;
}

export const paymentsApi = {
  createInvoice: (courseId: string) =>
    apiClient.post("/api/payments/invoice", { courseId }),

  checkStatus: (paymentId: string) =>
    apiClient.get(`/api/payments/status/${paymentId}`),

  myPayments: () => apiClient.get<Payment[]>("/api/payments/my"),

  getAll: () => apiClient.get<Payment[]>("/api/payments/all"),

  getPage: (page: number, pageSize: number) =>
    apiClient.get<PaymentsListPage>("/api/payments/all", {
      params: { page, limit: pageSize },
    }),
};
