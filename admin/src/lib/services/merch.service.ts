import { merchApi, CreateMerchRequest } from "../api/merch.api";

export const merchService = {
  getAll: async () => {
    try {
      const res = await merchApi.getAll();
      return res.data;
    } catch (error) {
      console.log("merchService.getAll error", error);
      throw error;
    }
  },

  getOne: async (id: string) => {
    try {
      const res = await merchApi.getOne(id);
      return res.data;
    } catch (error) {
      console.log("merchService.getOne error", error);
      throw error;
    }
  },

  create: async (data: CreateMerchRequest) => {
    try {
      const res = await merchApi.create(data);
      return res.data;
    } catch (error) {
      console.log("merchService.create error", error);
      throw error;
    }
  },

  updateStock: async (id: string, stock: number) => {
    try {
      const res = await merchApi.updateStock(id, stock);
      return res.data;
    } catch (error) {
      console.log("merchService.updateStock error", error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const res = await merchApi.delete(id);
      return res.data;
    } catch (error) {
      console.log("merchService.delete error", error);
      throw error;
    }
  },
};
