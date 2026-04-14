import { lessonsApi } from "../api/lessons.api";

export const lessonsService = {
  getOne: async (id: string) => {
    try {
      const res = await lessonsApi.getOne(id);
      return res.data;
    } catch (error) {
      console.log("lessonsService.getOne error", error);
      throw error;
    }
  },
};
