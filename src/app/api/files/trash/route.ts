import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/files/trash - Get all trashed files
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();
  const path = searchParams ? `/files/trash?${searchParams}` : "/files/trash";
  return proxyRequest(request, path);
}

// DELETE /api/files/trash - Empty trash
export async function DELETE(request: NextRequest) {
  return proxyRequest(request, "/files/trash");
}
