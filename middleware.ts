import { NextResponse, type NextRequest } from "next/server";
import {
  PATHNAME_HEADER,
  SESSION_COOKIE_NAME,
  routes,
} from "@/config/routes";
import { safeRedirectPath } from "@/lib/auth-hint";
import { getAdminPanelPath } from "@/config/admin";

const ADMIN_SLUG_PATH = /^\/[a-fA-F0-9]{32}$/;

/** Account-only: invoice history, settings, onboarding. */
const protectedPrefixes = [
  "/onboarding",
  "/invoices",
  "/files",
  "/settings",
  "/account",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (request.nextUrl.searchParams.get("clearSession") === "1") {
    const loginUrl = new URL(routes.login, request.url);
    const back = safeRedirectPath(request.nextUrl.searchParams.get("redirect"));
    if (back) loginUrl.searchParams.set("redirect", back);
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

  // Admin panel: only reachable at its secret path. /admin itself and any
  // other 32-hex path render the ordinary 404 page.
  if (pathname === routes.admin || pathname.startsWith(`${routes.admin}/`)) {
    return NextResponse.rewrite(new URL("/not-found-page", request.url));
  }
  if (ADMIN_SLUG_PATH.test(pathname)) {
    const adminPath = await getAdminPanelPath();
    if (adminPath && pathname.toLowerCase() === adminPath) {
      return NextResponse.rewrite(new URL(routes.admin, request.url));
    }
    return NextResponse.rewrite(new URL("/not-found-page", request.url));
  }

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !session) {
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtected) {
    const headers = new Headers(request.headers);
    headers.set(PATHNAME_HEADER, `${pathname}${request.nextUrl.search}`);
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/onboarding",
    "/onboarding/:path*",
    "/invoices",
    "/invoices/:path*",
    "/files",
    "/files/:path*",
    "/settings",
    "/settings/:path*",
    "/account",
    "/account/:path*",
    "/admin",
    "/admin/:path*",
    // Candidate secret admin paths (see config/admin.ts).
    "/:slug([a-fA-F0-9]{32})",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};
