import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/files/[id]/share - Cek status share file (butuh auth)
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyRequest(request, `/files/${id}/share`);
}

// POST /api/files/[id]/share - Aktifkan share publik (butuh auth)
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyRequest(request, `/files/${id}/share`);
}

// DELETE /api/files/[id]/share - Nonaktifkan share publik (butuh auth)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyRequest(request, `/files/${id}/share`);
}
