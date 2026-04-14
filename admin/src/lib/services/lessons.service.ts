import { lessonsApi, CreateLessonRequest, UpdateLessonRequest } from "../api/lessons.api";

export const lessonsService = {
  getAll: async () => {
    try {
      const res = await lessonsApi.getAll();
      return res.data;
    } catch (error) {
      console.log("lessonsService.getAll error", error);
      throw error;
    }
  },

  getOne: async (id: string) => {
    try {
      const res = await lessonsApi.getOne(id);
      return res.data;
    } catch (error) {
      console.log("lessonsService.getOne error", error);
      throw error;
    }
  },

  create: async (data: CreateLessonRequest) => {
    try {
      const res = await lessonsApi.create(data);
      return res.data;
    } catch (error) {
      console.log("lessonsService.create error", error);
      throw error;
    }
  },

  update: async (id: string, data: UpdateLessonRequest) => {
    try {
      const res = await lessonsApi.update(id, data);
      return res.data;
    } catch (error) {
      console.log("lessonsService.update error", error);
      throw error;
    }
  },

  togglePublish: async (id: string) => {
    try {
      const res = await lessonsApi.togglePublish(id);
      return res.data;
    } catch (error) {
      console.log("lessonsService.togglePublish error", error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const res = await lessonsApi.delete(id);
      return res.data;
    } catch (error) {
      console.log("lessonsService.delete error", error);
      throw error;
    }
  },
};
