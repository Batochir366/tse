import apiClient from "../apiClient";

export interface CreateInvoiceResponse {
  paymentId: string;
  invoiceId: string;
  qrImage: string;
  qrText: string;
  expiresAt: string;
  urls?: {
    name: string;
    description: string;
    logo: string;
    link: string;
  }[];
}

export interface PaymentStatusResponse {
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";
  paidAt?: string;
}

export interface Payment {
  _id: string;
  userId: string;
  itemType: "course" | "merch";
  itemId: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED";
  qpayInvoiceId?: string;
  qpayPaymentId?: string;
  invoiceExpiresAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  course?: { name: string };
}

export type ResumePaymentResponse = CreateInvoiceResponse & {
  courseId?: string;
};

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

  cancelPayment: async (paymentId: string): Promise<{ ok: boolean }> => {
    const { data } = await apiClient.post<{ ok: boolean }>(
      `/api/payments/cancel/${paymentId}`,
    );
    return data;
  },

  resumePayment: async (
    paymentId: string,
  ): Promise<ResumePaymentResponse> => {
    const { data } = await apiClient.get<ResumePaymentResponse>(
      `/api/payments/resume/${paymentId}`,
    );
    return data;
  },
};
