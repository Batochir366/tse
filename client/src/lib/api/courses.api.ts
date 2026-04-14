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
  } | string;
  order: number;
}

export interface CourseIncludedMerchPopulated {
  merchId: {
    _id: string;
    name: string;
    imageUrl: string;
    type: string;
    price: number;
  } | string;
  quantity: number;
}

export interface CourseDetail extends Omit<Course, "lessons" | "includedMerch"> {
  lessons: CourseLessonPopulated[];
  includedMerch: CourseIncludedMerchPopulated[];
}

export const coursesApi = {
  getAll: () => apiClient.get<Course[]>("/api/courses"),
  getOne: (id: string) => apiClient.get<CourseDetail>(`/api/courses/${id}`),
};
