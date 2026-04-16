import { usersApi } from "../api/users.api";

export const usersService = {
  getAll: async () => {
    try {
      const res = await usersApi.getAll();
      return res.data;
    } catch (error) {
      console.log("usersService.getAll error", error);
      throw error;
    }
  },
};
