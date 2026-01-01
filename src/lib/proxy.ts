import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:3001/api";

interface ProxyOptions {
  method?: string;
  body?: string | null;
  headers?: Record<string, string>;
}

export async function proxyRequest(
  request: NextRequest,
  path: string,
  options: ProxyOptions = {}
) {
  const url = `${API_URL}${path}`;

  // Forward authorization header if present
  const authHeader = request.headers.get("authorization");
  const contentType = request.headers.get("content-type") || "application/json";

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    ...options.headers,
  };

  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  try {
    const response = await fetch(url, {
      method: options.method || request.method,
      headers,
      body: options.body,
    });

    const data = await response.text();

    // Try to parse as JSON, otherwise return as text
    let responseData;
    try {
      responseData = JSON.parse(data);
    } catch {
      responseData = data;
    }

    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to connect to backend" },
      { status: 502 }
    );
  }
}

// Helper to get request body
export async function getRequestBody(
  request: NextRequest
): Promise<string | null> {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("text/plain")) {
      return await request.text();
    }

    const body = await request.json();
    return JSON.stringify(body);
  } catch {
    return null;
  }
}
