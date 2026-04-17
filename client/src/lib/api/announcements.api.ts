import apiClient from "../apiClient";

export type AnnouncementType = "concert" | "sale" | "poster" | "news";

export interface Announcement {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  type: AnnouncementType;
  link?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const announcementsApi = {
  getActive: async (): Promise<Announcement[]> => {
    const { data } = await apiClient.get<Announcement[]>("/api/announcements");
    return Array.isArray(data) ? data : [];
  },
};
