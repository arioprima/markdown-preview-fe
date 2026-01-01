import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/files/trash/count
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/files/trash/count");
}
