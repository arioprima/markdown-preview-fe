"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  const hasRun = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent double execution
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    // Handle error from OAuth provider
    if (errorParam) {
      router.replace(`/login?error=${encodeURIComponent(errorParam)}`);
      return;
    }

    // Validate token
    if (!token) {
      router.replace("/login?error=No+token+received");
      return;
    }

    // Use AuthContext to login with token
    loginWithToken(token).catch((err) => {
      console.error("OAuth callback error:", err);
      setError("Failed to complete login. Please try again.");
      // Redirect to login after a brief delay
      setTimeout(() => {
        router.replace("/login?error=OAuth+login+failed");
      }, 2000);
    });
  }, []);

  // Show error if any
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // Simple loading spinner while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
