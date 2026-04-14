import apiClient from "../apiClient";

export interface CreateInvoiceResponse {
  paymentId: string;
  invoiceId: string;
  qrImage: string;
  qrText: string;
  urls?: {
    name: string;
    description: string;
    logo: string;
    link: string;
  }[];
}

export interface PaymentStatusResponse {
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  paidAt?: string;
}

export interface Payment {
  _id: string;
  userId: string;
  itemType: "course" | "merch";
  itemId: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  qpayInvoiceId?: string;
  qpayPaymentId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const paymentApi = {
  createInvoice: async (courseId: string): Promise<CreateInvoiceResponse> => {
    const { data } = await apiClient.post<CreateInvoiceResponse>(
      "/api/payments/invoice",
      { courseId },
    );
    return data;
  },

  checkStatus: async (invoiceId: string): Promise<PaymentStatusResponse> => {
    const { data } = await apiClient.post<PaymentStatusResponse>(
      `/api/payments/check-status`,
      { invoice_id: invoiceId },
    );
    return data;
  },

  getMyPayments: async (): Promise<Payment[]> => {
    const { data } = await apiClient.get<Payment[]>("/api/payments/my");
    return data;
  },
};
