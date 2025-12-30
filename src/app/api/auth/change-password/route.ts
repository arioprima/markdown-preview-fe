import { NextRequest } from "next/server";
import { proxyRequest, getRequestBody } from "@/lib/proxy";

// PUT /api/auth/change-password
export async function PUT(request: NextRequest) {
  const body = await getRequestBody(request);
  return proxyRequest(request, "/auth/change-password", { body });
}
