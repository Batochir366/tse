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

export interface CreateLessonRequest {
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnail?: string;
}

export const lessonsApi = {
  getAll: () => apiClient.get<Lesson[]>("/api/lessons"),

  getOne: (id: string) => apiClient.get<Lesson>(`/api/lessons/${id}`),

  create: (data: CreateLessonRequest) =>
    apiClient.post<Lesson>("/api/lessons", data),

  update: (id: string, data: UpdateLessonRequest) =>
    apiClient.put<Lesson>(`/api/lessons/${id}`, data),

  togglePublish: (id: string) =>
    apiClient.patch<Lesson>(`/api/lessons/${id}/publish`),

  delete: (id: string) => apiClient.delete(`/api/lessons/${id}`),
};
