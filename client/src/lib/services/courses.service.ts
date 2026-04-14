import { coursesApi } from "../api/courses.api";

export const coursesService = {
  getAll: async () => {
    try {
      const res = await coursesApi.getAll();
      return res.data;
    } catch (error) {
      console.log("coursesService.getAll error", error);
      throw error;
    }
  },

  getOne: async (id: string) => {
    try {
      const res = await coursesApi.getOne(id);
      return res.data;
    } catch (error) {
      console.log("coursesService.getOne error", error);
      throw error;
    }
  },
};
