// User types
export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

// File types
export interface MarkdownFile {
  id: string;
  title: string;
  content: string;
  user_id: string;
  group_id: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

// Group types
export interface Group {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  markdownFiles?: MarkdownFile[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Extended MarkdownFile with group info from search
export interface MarkdownFileWithGroup extends MarkdownFile {
  group?: {
    id: string;
    name: string;
  } | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CountResponse {
  count: number;
}

// API Error
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
}
