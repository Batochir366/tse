import apiClient from "../apiClient";

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  isPublished: boolean;
  createdAt?: string;
}

export const lessonsApi = {
  getOne: (id: string) => apiClient.get<Lesson>(`/api/lessons/${id}`),
};
