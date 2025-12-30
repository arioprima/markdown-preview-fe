import { NextRequest } from "next/server";
import { proxyRequest, getRequestBody } from "@/lib/proxy";

// GET /api/auth/profile
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/auth/profile");
}

// PUT /api/auth/profile
export async function PUT(request: NextRequest) {
  const body = await getRequestBody(request);
  return proxyRequest(request, "/auth/profile", { body });
}
