import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/files/trash/[id] - Permanent delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyRequest(request, `/files/trash/${id}`);
}
