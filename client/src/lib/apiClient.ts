import axios from "axios";
import { unwrapEncryptedResponseBody } from "./cryptoClient";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://microphysical-tameka-explicitly.ngrok-free.dev";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
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
