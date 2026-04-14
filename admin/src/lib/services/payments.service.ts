import { paymentsApi } from "../api/payments.api";

export const paymentsService = {
  getAll: async () => {
    try {
      const res = await paymentsApi.getAll();
      return res.data;
    } catch (error) {
      console.log("paymentsService.getAll error", error);
      throw error;
    }
  },

  checkStatus: async (paymentId: string) => {
    try {
      const res = await paymentsApi.checkStatus(paymentId);
      return res.data;
    } catch (error) {
      console.log("paymentsService.checkStatus error", error);
      throw error;
    }
  },

  createInvoice: async (courseId: string) => {
    try {
      const res = await paymentsApi.createInvoice(courseId);
      return res.data;
    } catch (error) {
      console.log("paymentsService.createInvoice error", error);
      throw error;
    }
  },
};
