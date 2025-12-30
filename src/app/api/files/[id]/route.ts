import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/files/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyRequest(request, `/files/${id}`);
}

// PUT /api/files/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams.toString();
  const path = searchParams ? `/files/${id}?${searchParams}` : `/files/${id}`;
  const body = await request.text();
  return proxyRequest(request, path, {
    body,
    headers: { "Content-Type": "text/plain" },
  });
}

// DELETE /api/files/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyRequest(request, `/files/${id}`);
}
