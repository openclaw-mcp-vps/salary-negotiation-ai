import { NextResponse, type NextRequest } from "next/server";

import { verifyAccessTokenEdge } from "@/lib/access-edge";
import { ACCESS_COOKIE_NAME } from "@/lib/access-constants";

function isApiPath(pathname: string) {
  return pathname.startsWith("/api/");
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (token && (await verifyAccessTokenEdge(token))) {
    return NextResponse.next();
  }

  if (isApiPath(request.nextUrl.pathname)) {
    return NextResponse.json(
      {
        error: "Purchase required before using negotiation endpoints.",
      },
      { status: 401 },
    );
  }

  const redirect = new URL("/", request.url);
  redirect.searchParams.set("paywall", "1");
  return NextResponse.redirect(redirect);
}

export const config = {
  matcher: ["/negotiate/:path*", "/api/analyze-offer", "/api/generate-response"],
};
