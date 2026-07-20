import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, authRoutes, routes } from "@/config/routes";

const protectedPrefixes = [
  "/dashboard",
  "/onboarding",
  "/customers",
  "/invoices",
  "/services",
  "/settings",
];

const authPrefixes = ["/login", "/signup", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = authPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !session) {
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL(routes.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/customers/:path*",
    "/invoices/:path*",
    "/services/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};
