import { NextResponse, type NextRequest } from "next/server";

import { verifyAdminAccess } from "@/services/auth/authProxyService";

const ACCESS_TOKEN_COOKIE = "accessToken";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  const authorization = await verifyAdminAccess(token);

  if (authorization === "allowed") {
    return NextResponse.next();
  }

  if (authorization === "unauthenticated") {
    const response = redirectToLogin(request);
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    return response;
  }

  if (authorization === "forbidden") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.json(
    { message: "Impossible de vérifier l'accès au tableau de bord." },
    { status: 503 },
  );
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/auth", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
