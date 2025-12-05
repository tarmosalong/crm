import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Use Node.js runtime for middleware (not Edge) to support pg/crypto
export const runtime = "nodejs";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authjs.session-token") || 
                request.cookies.get("__Secure-authjs.session-token");
  
  const isLoggedIn = !!token;
  const pathname = request.nextUrl.pathname;
  
  const isOnDashboard = pathname.startsWith("/dashboard") ||
                        pathname.startsWith("/contacts") ||
                        pathname.startsWith("/companies") ||
                        pathname.startsWith("/deals") ||
                        pathname.startsWith("/tasks") ||
                        pathname.startsWith("/reports");
  const isOnAuth = pathname.startsWith("/login") || pathname.startsWith("/register");

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isOnAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect non-logged-in users to login
  if (!isLoggedIn && isOnDashboard) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};

