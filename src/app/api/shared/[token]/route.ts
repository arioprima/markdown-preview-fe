import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface RouteParams {
  params: Promise<{ token: string }>;
}

// GET /api/shared/[token] - Ambil konten file yang dibagikan (publik, tanpa auth)
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { token } = await params;
  return proxyRequest(request, `/shared/${token}`);
}
