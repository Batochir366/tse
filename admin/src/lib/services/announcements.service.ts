import {
  announcementsApi,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "../api/announcements.api";

export const announcementsService = {
  getAll: async () => {
    try {
      const res = await announcementsApi.getAll();
      return res.data;
    } catch (error) {
      console.log("announcementsService.getAll error", error);
      throw error;
    }
  },

  getActive: async () => {
    try {
      const res = await announcementsApi.getActive();
      return res.data;
    } catch (error) {
      console.log("announcementsService.getActive error", error);
      throw error;
    }
  },

  create: async (data: CreateAnnouncementRequest) => {
    try {
      const res = await announcementsApi.create(data);
      return res.data;
    } catch (error) {
      console.log("announcementsService.create error", error);
      throw error;
    }
  },

  update: async (id: string, data: UpdateAnnouncementRequest) => {
    try {
      const res = await announcementsApi.update(id, data);
      return res.data;
    } catch (error) {
      console.log("announcementsService.update error", error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const res = await announcementsApi.delete(id);
      return res.data;
    } catch (error) {
      console.log("announcementsService.delete error", error);
      throw error;
    }
  },
};
