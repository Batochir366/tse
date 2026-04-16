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

  cancelPayment: async (paymentId: string) => {
    return await paymentApi.cancelPayment(paymentId);
  },

  resumePayment: async (paymentId: string) => {
    return await paymentApi.resumePayment(paymentId);
  },
};
