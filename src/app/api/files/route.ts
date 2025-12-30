import { NextRequest } from "next/server";
import { proxyRequest, getRequestBody } from "@/lib/proxy";

// GET /api/files - Get all files with pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();
  const path = searchParams ? `/files?${searchParams}` : "/files";
  return proxyRequest(request, path);
}

// POST /api/files - Create new file
export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();
  const path = searchParams ? `/files?${searchParams}` : "/files";
  const body = await request.text();
  return proxyRequest(request, path, {
    body,
    headers: { "Content-Type": "text/plain" },
  });
}

// DELETE /api/files - Bulk delete files
export async function DELETE(request: NextRequest) {
  const body = await getRequestBody(request);
  return proxyRequest(request, "/files", { body });
}
