import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("unblock_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/request") ||
    pathname.startsWith("/room") ||
    pathname.startsWith("/mentor");

  const isAuthPath = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/wallet/:path*",
    "/request/:path*",
    "/room/:path*",
    "/mentor/:path*",
    "/login",
    "/register",
  ],
};
