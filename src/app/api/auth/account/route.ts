import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// DELETE /api/auth/account
export async function DELETE(request: NextRequest) {
  return proxyRequest(request, "/auth/account");
}
