import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
interface Decoded {
  type: string;
}
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Public paths that don't require authentication
  const publicPaths = ["/auth/login", "/auth/register"];

  if (!token && !publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If we have a token, check user type for protected routes
  if (token) {
    try {
      const decoded: Decoded = jwtDecode(token);
      const userType = decoded.type;

      // Admin only routes
      if (
        request.nextUrl.pathname.startsWith("/admin") &&
        userType !== "admin" &&
        userType !== "user"
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Client only routes
      if (
        request.nextUrl.pathname.startsWith("/client") &&
        userType !== "client"
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      // If token is invalid, redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run the middleware on
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/client/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
