export interface Endpoint {
  label: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  auth: boolean;
  defaultBody?: string;
  pathParams?: string[];
  description?: string;
}

export interface EndpointGroup {
  group: string;
  endpoints: Endpoint[];
}

export const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    group: "Admin Auth",
    endpoints: [
      {
        label: "Login",
        method: "POST",
        path: "/api/admin/auth/login",
        auth: false,
        defaultBody: JSON.stringify({ email: "", password: "" }, null, 2),
        description: "Admin нэвтрэх",
      },
      {
        label: "Me",
        method: "GET",
        path: "/api/admin/auth/me",
        auth: true,
        description: "Нэвтэрсэн admin мэдээлэл",
      },
      {
        label: "Logout",
        method: "POST",
        path: "/api/admin/auth/logout",
        auth: true,
        description: "Гарах",
      },
    ],
  },
  {
    group: "User Auth",
    endpoints: [
      {
        label: "Register",
        method: "POST",
        path: "/api/auth/register",
        auth: false,
        defaultBody: JSON.stringify({ name: "", email: "", password: "", phone: "" }, null, 2),
      },
      {
        label: "Login",
        method: "POST",
        path: "/api/auth/login",
        auth: false,
        defaultBody: JSON.stringify({ email: "", password: "" }, null, 2),
      },
      {
        label: "Me",
        method: "GET",
        path: "/api/auth/me",
        auth: true,
      },
      {
        label: "Refresh",
        method: "POST",
        path: "/api/auth/refresh",
        auth: false,
      },
      {
        label: "Logout",
        method: "POST",
        path: "/api/auth/logout",
        auth: false,
      },
    ],
  },
  {
    group: "Courses",
    endpoints: [
      {
        label: "Get All",
        method: "GET",
        path: "/api/courses",
        auth: false,
      },
      {
        label: "Get One",
        method: "GET",
        path: "/api/courses/:id",
        auth: false,
        pathParams: ["id"],
      },
      {
        label: "Create",
        method: "POST",
        path: "/api/courses",
        auth: true,
        defaultBody: JSON.stringify(
          {
            name: "",
            description: "",
            coverImage: "",
            lessons: [],
            price: 0,
            durationDays: 30,
            includedMerch: [],
            order: 0,
          },
          null,
          2
        ),
      },
      {
        label: "Update",
        method: "PUT",
        path: "/api/courses/:id",
        auth: true,
        pathParams: ["id"],
        defaultBody: JSON.stringify({ name: "", description: "", price: 0 }, null, 2),
      },
      {
        label: "Add Lesson",
        method: "POST",
        path: "/api/courses/:id/lessons",
        auth: true,
        pathParams: ["id"],
        defaultBody: JSON.stringify({ lessonId: "", order: 1 }, null, 2),
      },
      {
        label: "Remove Lesson",
        method: "DELETE",
        path: "/api/courses/:id/lessons/:lessonId",
        auth: true,
        pathParams: ["id", "lessonId"],
      },
      {
        label: "Reorder Lessons",
        method: "PUT",
        path: "/api/courses/:id/lessons/reorder",
        auth: true,
        pathParams: ["id"],
        defaultBody: JSON.stringify([{ lessonId: "", order: 1 }], null, 2),
      },
      {
        label: "Add Merch",
        method: "POST",
        path: "/api/courses/:id/merch",
        auth: true,
        pathParams: ["id"],
        defaultBody: JSON.stringify({ merchId: "", quantity: 1 }, null, 2),
      },
      {
        label: "Remove Merch",
        method: "DELETE",
        path: "/api/courses/:id/merch/:merchId",
        auth: true,
        pathParams: ["id", "merchId"],
      },
      {
        label: "Delete",
        method: "DELETE",
        path: "/api/courses/:id",
        auth: true,
        pathParams: ["id"],
      },
    ],
  },
  {
    group: "Lessons",
    endpoints: [
      {
        label: "Get All",
        method: "GET",
        path: "/api/lessons",
        auth: true,
      },
      {
        label: "Get One",
        method: "GET",
        path: "/api/lessons/:id",
        auth: true,
        pathParams: ["id"],
      },
      {
        label: "Create",
        method: "POST",
        path: "/api/lessons",
        auth: true,
        defaultBody: JSON.stringify(
          { title: "", description: "", driveFileId: "", thumbnail: "" },
          null,
          2
        ),
      },
      {
        label: "Update",
        method: "PUT",
        path: "/api/lessons/:id",
        auth: true,
        pathParams: ["id"],
        defaultBody: JSON.stringify({ title: "", description: "" }, null, 2),
      },
      {
        label: "Toggle Publish",
        method: "PATCH",
        path: "/api/lessons/:id/publish",
        auth: true,
        pathParams: ["id"],
      },
      {
        label: "Delete",
        method: "DELETE",
        path: "/api/lessons/:id",
        auth: true,
        pathParams: ["id"],
      },
    ],
  },
  {
    group: "Payments",
    endpoints: [
      {
        label: "Create Invoice",
        method: "POST",
        path: "/api/payments/invoice",
        auth: true,
        defaultBody: JSON.stringify({ courseId: "" }, null, 2),
      },
      {
        label: "Check Status",
        method: "GET",
        path: "/api/payments/status/:paymentId",
        auth: true,
        pathParams: ["paymentId"],
      },
      {
        label: "My Payments",
        method: "GET",
        path: "/api/payments/my",
        auth: true,
      },
      {
        label: "All Payments (Admin)",
        method: "GET",
        path: "/api/payments/all",
        auth: true,
      },
    ],
  },
  {
    group: "Merch",
    endpoints: [
      {
        label: "Get All",
        method: "GET",
        path: "/api/merch",
        auth: false,
      },
      {
        label: "Get One",
        method: "GET",
        path: "/api/merch/:id",
        auth: false,
        pathParams: ["id"],
      },
      {
        label: "Create",
        method: "POST",
        path: "/api/merch",
        auth: true,
        defaultBody: JSON.stringify(
          { name: "", type: "pin", imageUrl: "", price: 0, stock: 10 },
          null,
          2
        ),
      },
      {
        label: "Update Stock",
        method: "PATCH",
        path: "/api/merch/:id/stock",
        auth: true,
        pathParams: ["id"],
        defaultBody: JSON.stringify({ stock: 0 }, null, 2),
      },
      {
        label: "Delete",
        method: "DELETE",
        path: "/api/merch/:id",
        auth: true,
        pathParams: ["id"],
      },
    ],
  },
  {
    group: "Announcements",
    endpoints: [
      {
        label: "Get Active",
        method: "GET",
        path: "/api/announcements",
        auth: false,
      },
      {
        label: "Get All (Admin)",
        method: "GET",
        path: "/api/announcements/all",
        auth: true,
      },
      {
        label: "Create",
        method: "POST",
        path: "/api/announcements",
        auth: true,
        defaultBody: JSON.stringify(
          { title: "", type: "news", description: "", imageUrl: "", link: "" },
          null,
          2
        ),
      },
      {
        label: "Update",
        method: "PUT",
        path: "/api/announcements/:id",
        auth: true,
        pathParams: ["id"],
        defaultBody: JSON.stringify({ title: "", isActive: true }, null, 2),
      },
      {
        label: "Delete",
        method: "DELETE",
        path: "/api/announcements/:id",
        auth: true,
        pathParams: ["id"],
      },
    ],
  },
];
