import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  ApiResponse,
  AuthResponse,
  MarkdownFile,
  PaginatedResponse,
  User,
  LoginCredentials,
  RegisterCredentials,
  ChangePasswordData,
  UpdateProfileData,
  CountResponse,
} from "@/types";

// Create axios instance - uses Next.js API routes as proxy
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Jangan redirect jika sedang login/register
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");

      if (!isAuthEndpoint && typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============ AUTH API ============

export const authApi = {
  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (
    credentials: RegisterCredentials
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post("/auth/register", credentials);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileData
  ): Promise<ApiResponse<User>> => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },

  changePassword: async (
    data: ChangePasswordData
  ): Promise<ApiResponse<null>> => {
    const response = await api.put("/auth/change-password", data);
    return response.data;
  },

  deleteAccount: async (): Promise<ApiResponse<null>> => {
    const response = await api.delete("/auth/account");
    return response.data;
  },
};

// ============ FILES API ============

export const filesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: "asc" | "desc";
    search?: string;
  }): Promise<PaginatedResponse<MarkdownFile>> => {
    const response = await api.get("/files", { params });
    return response.data;
  },

  getCount: async (): Promise<ApiResponse<CountResponse>> => {
    const response = await api.get("/files/count");
    return response.data;
  },

  getRecent: async (limit = 5): Promise<ApiResponse<MarkdownFile[]>> => {
    const response = await api.get("/files/recent", { params: { limit } });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<MarkdownFile>> => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  create: async (
    title: string,
    content: string
  ): Promise<ApiResponse<MarkdownFile>> => {
    const response = await api.post(
      `/files?title=${encodeURIComponent(title)}`,
      content,
      {
        headers: { "Content-Type": "text/plain" },
      }
    );
    return response.data;
  },

  update: async (
    id: string,
    title: string,
    content: string
  ): Promise<ApiResponse<MarkdownFile>> => {
    const response = await api.put(
      `/files/${id}?title=${encodeURIComponent(title)}`,
      content,
      {
        headers: { "Content-Type": "text/plain" },
      }
    );
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  bulkDelete: async (ids: string[]): Promise<ApiResponse<null>> => {
    const response = await api.delete("/files", { data: { ids } });
    return response.data;
  },
};

// ============ TRASH API ============

export const trashApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<MarkdownFile>> => {
    const response = await api.get("/files/trash", { params });
    return response.data;
  },

  getCount: async (): Promise<ApiResponse<CountResponse>> => {
    const response = await api.get("/files/trash/count");
    return response.data;
  },

  restore: async (id: string): Promise<ApiResponse<MarkdownFile>> => {
    const response = await api.post(`/files/trash/${id}/restore`);
    return response.data;
  },

  restoreAll: async (): Promise<ApiResponse<null>> => {
    const response = await api.post("/files/trash/restore-all");
    return response.data;
  },

  permanentDelete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/files/trash/${id}`);
    return response.data;
  },

  emptyTrash: async (): Promise<ApiResponse<null>> => {
    const response = await api.delete("/files/trash");
    return response.data;
  },
};

export default api;
