import apiClient from "../apiClient";

export interface CourseLessonRef {
  lessonId: string;
  order: number;
}

export interface CourseIncludedMerch {
  merchId: string;
  quantity: number;
}

export interface Course {
  _id: string;
  name: string;
  description: string;
  coverImage?: string;
  lessons: CourseLessonRef[];
  price: number;
  durationDays: number;
  includedMerch: CourseIncludedMerch[];
  isActive: boolean;
  isFree: boolean;
  order: number;
  createdAt?: string;
}

export interface CourseLessonPopulated {
  lessonId: {
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    videoUrl?: string;
    isPublished?: boolean;
  };
  order: number;
}

export interface CourseIncludedMerchPopulated {
  merchId: {
    _id: string;
    name: string;
    imageUrl: string;
    type: string;
    price: number;
  };
  quantity: number;
}

export interface CourseDetail extends Omit<Course, "lessons" | "includedMerch"> {
  lessons: CourseLessonPopulated[];
  includedMerch: CourseIncludedMerchPopulated[];
}

export interface CreateCourseRequest {
  name: string;
  description: string;
  coverImage?: string;
  lessons?: CourseLessonRef[];
  price: number;
  durationDays: number;
  includedMerch?: CourseIncludedMerch[];
  order?: number;
}

export interface UpdateCourseRequest {
  name?: string;
  description?: string;
  coverImage?: string;
  lessons?: CourseLessonRef[];
  price?: number;
  durationDays?: number;
  includedMerch?: CourseIncludedMerch[];
  isActive?: boolean;
  isFree?: boolean;
  order?: number;
}

export const coursesApi = {
  getAll: () => apiClient.get<Course[]>("/api/courses"),

  getOne: (id: string) => apiClient.get<CourseDetail>(`/api/courses/${id}`),

  create: (data: CreateCourseRequest) =>
    apiClient.post<Course>("/api/courses", data),

  update: (id: string, data: UpdateCourseRequest) =>
    apiClient.put<Course>(`/api/courses/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/courses/${id}`),

  addLesson: (id: string, lessonId: string, order?: number) =>
    apiClient.post<Course>(`/api/courses/${id}/lessons`, { lessonId, order }),

  removeLesson: (courseId: string, lessonId: string) =>
    apiClient.delete<Course>(`/api/courses/${courseId}/lessons/${lessonId}`),

  reorderLessons: (id: string, items: { lessonId: string; order: number }[]) =>
    apiClient.put<Course>(`/api/courses/${id}/lessons/reorder`, items),

  addMerch: (id: string, merchId: string, quantity?: number) =>
    apiClient.post<Course>(`/api/courses/${id}/merch`, { merchId, quantity }),

  removeMerch: (courseId: string, merchId: string) =>
    apiClient.delete<Course>(`/api/courses/${courseId}/merch/${merchId}`),
};
