import { NextRequest } from "next/server";
import { proxyRequest, getRequestBody } from "@/lib/proxy";

// POST /api/auth/login
export async function POST(request: NextRequest) {
  const body = await getRequestBody(request);
  return proxyRequest(request, "/auth/login", { body });
}
