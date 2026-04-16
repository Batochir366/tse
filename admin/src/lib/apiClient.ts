import axios from "axios";
import { unwrapEncryptedResponseBody } from "./cryptoClient";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://microphysical-tameka-explicitly.ngrok-free.dev";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    response.data = unwrapEncryptedResponseBody(response.data);
    return response;
  },
  (error) => {
    if (error.response?.data !== undefined) {
      error.response.data = unwrapEncryptedResponseBody(error.response.data);
    }
    return Promise.reject(error);
  },
);

export default apiClient;

// Legacy fetch wrapper kept for tester/page.tsx compatibility
export interface ApiResponse {
  status: number;
  ok: boolean;
  data: unknown;
  elapsedMs: number;
}

export async function callApi(
  method: string,
  path: string,
  body?: string,
  token?: string,
): Promise<ApiResponse> {
  const start = Date.now();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    options.body = body;
  }

  const res = await fetch(`${BASE_URL}${path}`, options);
  const elapsedMs = Date.now() - start;

  let data: unknown;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    data = unwrapEncryptedResponseBody(await res.json());
  } else {
    data = await res.text();
  }

  return { status: res.status, ok: res.ok, data, elapsedMs };
}
