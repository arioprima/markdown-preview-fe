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
  Group,
} from "@/types";

// Create axios instance - uses Next.js API routes as proxy
const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Enable cookie sending
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Don't redirect if on auth endpoints or profile check
      const url = error.config?.url || "";
      const isAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/profile"); // Don't redirect on profile check

      // Also check if already on login page to prevent infinite loop
      const isOnLoginPage =
        typeof window !== "undefined" && window.location.pathname === "/login";

      if (!isAuthEndpoint && !isOnLoginPage && typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// ============ AUTH API ============

export const authApi = {
  login: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (
    credentials: RegisterCredentials,
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post("/auth/register", credentials);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileData,
  ): Promise<ApiResponse<User>> => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },

  changePassword: async (
    data: ChangePasswordData,
  ): Promise<ApiResponse<null>> => {
    const response = await api.put("/auth/change-password", data);
    return response.data;
  },

  deleteAccount: async (): Promise<ApiResponse<null>> => {
    const response = await api.delete("/auth/account");
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Google OAuth
  getGoogleAuthUrl: (): string => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    return `${API_URL}/auth/google`;
  },

  // GitHub OAuth
  getGitHubAuthUrl: (): string => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    return `${API_URL}/auth/github`;
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
    ungrouped?: boolean;
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
    content: string,
    groupId?: string | null,
  ): Promise<ApiResponse<MarkdownFile>> => {
    let url = `/files?title=${encodeURIComponent(title)}`;
    if (groupId) {
      url += `&group_id=${encodeURIComponent(groupId)}`;
    }
    const response = await api.post(url, content, {
      headers: { "Content-Type": "text/plain" },
    });
    return response.data;
  },

  update: async (
    id: string,
    title: string,
    content: string,
    groupId?: string | null,
  ): Promise<ApiResponse<MarkdownFile>> => {
    let url = `/files/${id}?title=${encodeURIComponent(title)}`;
    if (groupId !== undefined) {
      url += `&group_id=${groupId === null ? "" : encodeURIComponent(groupId)}`;
    }
    const response = await api.put(url, content, {
      headers: { "Content-Type": "text/plain" },
    });
    return response.data;
  },

  updateGroup: async (
    id: string,
    groupId: string | null,
  ): Promise<ApiResponse<MarkdownFile>> => {
    // First fetch the file to get current content and title
    const fileResponse = await api.get(`/files/${id}`);
    const file = fileResponse.data.data;

    // Build URL with title and group_id
    let url = `/files/${id}?title=${encodeURIComponent(file.title || "")}`;
    url += `&group_id=${groupId === null ? "" : encodeURIComponent(groupId)}`;

    // Send update with existing content preserved
    const response = await api.put(url, file.content || "", {
      headers: { "Content-Type": "text/plain" },
    });
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

// ============ GROUPS API ============

export const groupsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Group>> => {
    const response = await api.get("/groups", { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Group>> => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  create: async (name: string): Promise<ApiResponse<Group>> => {
    const response = await api.post("/groups", { name });
    return response.data;
  },

  update: async (id: string, name: string): Promise<ApiResponse<Group>> => {
    const response = await api.put(`/groups/${id}`, { name });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  },
};

export default api;
