import {
  paymentApi,
  CreateInvoiceResponse,
  PaymentStatusResponse,
  Payment,
} from "../api/payment.api";

export const paymentService = {
  createInvoice: async (courseId: string): Promise<CreateInvoiceResponse> => {
    return await paymentApi.createInvoice(courseId);
  },

  checkStatus: async (invoiceId: string): Promise<PaymentStatusResponse> => {
    return await paymentApi.checkStatus(invoiceId);
  },

  getMyPayments: async (): Promise<Payment[]> => {
    return await paymentApi.getMyPayments();
  },
};
