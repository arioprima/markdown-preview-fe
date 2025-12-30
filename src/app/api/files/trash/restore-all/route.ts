import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// POST /api/files/trash/restore-all
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/files/trash/restore-all");
}
