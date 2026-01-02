"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User, LoginCredentials, RegisterCredentials } from "@/types";
import { authApi } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithCookie: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      // Cookie automatically sent, just call profile
      const response = await authApi.getProfile();
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    // Cookie is set by backend, just update user state
    setUser(response.data.user);
    router.push("/dashboard");
  };

  const loginWithCookie = async () => {
    // After OAuth callback, cookie is already set by backend
    // Just fetch profile to get user data
    const response = await authApi.getProfile();
    setUser(response.data);
    router.push("/dashboard");
  };

  const register = async (credentials: RegisterCredentials) => {
    const response = await authApi.register(credentials);
    // Cookie is set by backend, just update user state
    setUser(response.data.user);
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      await authApi.logout(); // Clear cookie on backend
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithCookie,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
