import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, routes } from "@/config/routes";

const protectedPrefixes = [
  "/dashboard",
  "/onboarding",
  "/customers",
  "/invoices",
  "/services",
  "/settings",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (request.nextUrl.searchParams.get("clearSession") === "1") {
    const loginUrl = new URL(routes.login, request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !session) {
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/customers",
    "/customers/:path*",
    "/invoices",
    "/invoices/:path*",
    "/services",
    "/services/:path*",
    "/settings",
    "/settings/:path*",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};
