import apiClient from "../apiClient";

export interface UserNotification {
  _id: string;
  userId: string;
  type: "payment_paid" | "profile_updated" | "avatar_updated";
  title: string;
  body: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const notificationsApi = {
  list: (limit = 50) =>
    apiClient.get<UserNotification[]>("/api/notifications", {
      params: { limit },
    }),

  markRead: (id: string) =>
    apiClient.patch<UserNotification>(`/api/notifications/${id}/read`),
};
