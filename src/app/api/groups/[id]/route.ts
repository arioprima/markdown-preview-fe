import { NextRequest } from "next/server";
import { proxyRequest, getRequestBody } from "@/lib/proxy";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/groups/:id - Get single group
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyRequest(request, `/groups/${id}`);
}

// PUT /api/groups/:id - Update group
export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await getRequestBody(request);
  return proxyRequest(request, `/groups/${id}`, { body });
}

// DELETE /api/groups/:id - Delete group
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyRequest(request, `/groups/${id}`);
}
