import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/files/recent
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();
  const path = searchParams ? `/files/recent?${searchParams}` : "/files/recent";
  return proxyRequest(request, path);
}
