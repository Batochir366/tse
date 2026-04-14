import { coursesApi, CreateCourseRequest, UpdateCourseRequest } from "../api/courses.api";

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

  create: async (data: CreateCourseRequest) => {
    try {
      const res = await coursesApi.create(data);
      return res.data;
    } catch (error) {
      console.log("coursesService.create error", error);
      throw error;
    }
  },

  update: async (id: string, data: UpdateCourseRequest) => {
    try {
      const res = await coursesApi.update(id, data);
      return res.data;
    } catch (error) {
      console.log("coursesService.update error", error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const res = await coursesApi.delete(id);
      return res.data;
    } catch (error) {
      console.log("coursesService.delete error", error);
      throw error;
    }
  },

  addLesson: async (courseId: string, lessonId: string, order?: number) => {
    try {
      const res = await coursesApi.addLesson(courseId, lessonId, order);
      return res.data;
    } catch (error) {
      console.log("coursesService.addLesson error", error);
      throw error;
    }
  },

  removeLesson: async (courseId: string, lessonId: string) => {
    try {
      const res = await coursesApi.removeLesson(courseId, lessonId);
      return res.data;
    } catch (error) {
      console.log("coursesService.removeLesson error", error);
      throw error;
    }
  },

  reorderLessons: async (courseId: string, items: { lessonId: string; order: number }[]) => {
    try {
      const res = await coursesApi.reorderLessons(courseId, items);
      return res.data;
    } catch (error) {
      console.log("coursesService.reorderLessons error", error);
      throw error;
    }
  },

  addMerch: async (courseId: string, merchId: string, quantity?: number) => {
    try {
      const res = await coursesApi.addMerch(courseId, merchId, quantity);
      return res.data;
    } catch (error) {
      console.log("coursesService.addMerch error", error);
      throw error;
    }
  },

  removeMerch: async (courseId: string, merchId: string) => {
    try {
      const res = await coursesApi.removeMerch(courseId, merchId);
      return res.data;
    } catch (error) {
      console.log("coursesService.removeMerch error", error);
      throw error;
    }
  },
};
