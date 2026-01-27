import { NextRequest } from "next/server";
import { proxyRequest, getRequestBody } from "@/lib/proxy";

// GET /api/groups - Get all groups with pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();
  const path = searchParams ? `/groups?${searchParams}` : "/groups";
  return proxyRequest(request, path);
}

// POST /api/groups - Create new group
export async function POST(request: NextRequest) {
  const body = await getRequestBody(request);
  return proxyRequest(request, "/groups", { body });
}
