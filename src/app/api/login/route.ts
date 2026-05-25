import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  AUTH_COOKIE_VALUE,
  isValidLogin,
} from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");
  const next = formData.get("next");

  if (!isValidLogin(username, password)) {
    return NextResponse.redirect(new URL("/login?error=1", request.url), {
      status: 303,
    });
  }

  const redirectTo = typeof next === "string" && next.startsWith("/") ? next : "/";
  const response = NextResponse.redirect(new URL(redirectTo, request.url), {
    status: 303,
  });

  response.cookies.set(AUTH_COOKIE, AUTH_COOKIE_VALUE, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
