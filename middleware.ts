import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicPaths = [
    "/",
    "/handler",
    "/api/health",
  ];

  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith("/handler/")
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check if user is authenticated for protected routes
  const user = await stackServerApp.getUser();

  if (!user) {
    // Redirect to sign-in page
    return NextResponse.redirect(new URL("/handler/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes that should be public
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
