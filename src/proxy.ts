import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, AUTH_COOKIE_VALUE } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const session = request.cookies.get(AUTH_COOKIE)?.value;

  if (session === AUTH_COOKIE_VALUE) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/", "/profiles/:path*"],
};
