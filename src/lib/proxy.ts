import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL;

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

  // Forward cookie header for auth
  const cookieHeader = request.headers.get("cookie");
  const contentType = request.headers.get("content-type") || "application/json";

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    ...options.headers,
  };

  if (cookieHeader) {
    headers["Cookie"] = cookieHeader;
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

    const nextResponse = NextResponse.json(responseData, {
      status: response.status,
    });

    // Forward Set-Cookie from backend to client
    // Use getSetCookie() to properly handle multiple cookies
    const setCookies = response.headers.getSetCookie();
    if (setCookies && setCookies.length > 0) {
      setCookies.forEach((cookie) => {
        // Fix cookie attributes for localhost development
        let modifiedCookie = cookie;

        // Remove Domain attribute so cookie works on localhost
        modifiedCookie = modifiedCookie.replace(/Domain=[^;]+;?\s?/gi, "");

        // If not running in production, adjust Secure and SameSite
        if (process.env.NODE_ENV !== "production") {
          // Remove Secure if present to allow HTTP on localhost
          modifiedCookie = modifiedCookie.replace(/Secure;?\s?/gi, "");
          // Change SameSite=None to SameSite=Lax for better local dev compatibility
          // (SameSite=None requires Secure)
          modifiedCookie = modifiedCookie.replace(
            /SameSite=None/gi,
            "SameSite=Lax"
          );
        }

        nextResponse.headers.append("Set-Cookie", modifiedCookie);
      });
    }

    return nextResponse;
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
