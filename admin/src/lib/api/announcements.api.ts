import apiClient from "../apiClient";

export interface Announcement {
  _id: string;
  title: string;
  type: string;
  description: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  type: string;
  description: string;
  imageUrl: string;
  link: string;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  type?: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  isActive?: boolean;
}

export const announcementsApi = {
  getActive: () => apiClient.get<Announcement[]>("/api/announcements"),

  getAll: () => apiClient.get<Announcement[]>("/api/announcements/all"),

  create: (data: CreateAnnouncementRequest) =>
    apiClient.post<Announcement>("/api/announcements", data),

  update: (id: string, data: UpdateAnnouncementRequest) =>
    apiClient.put<Announcement>(`/api/announcements/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/announcements/${id}`),
};
