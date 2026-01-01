import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/files/trash/[id]/restore
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyRequest(request, `/files/trash/${id}/restore`);
}
