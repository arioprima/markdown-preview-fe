import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/files/count
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/files/count");
}
