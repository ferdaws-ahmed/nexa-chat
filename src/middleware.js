import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get auth token and user from cookies
  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;

  let user = null;
  try {
    if (userCookie && userCookie !== "undefined") {
      user = JSON.parse(decodeURIComponent(userCookie));
    }
  } catch (error) {
    console.error("Error parsing user cookie:", error);
  }

  // DASHBOARD ROUTE PROTECTION
  if (pathname.startsWith("/dashboard")) {
    // No token means not authenticated
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // If no user data, also redirect to login
    if (!user || !user.role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Strict role-based protection for admin routes
    if (pathname.startsWith("/dashboard/admin")) {
      if (user.role.toLowerCase() !== "admin") {
        return NextResponse.redirect(new URL("/dashboard/user", request.url));
      }
    }

    // Redirect bare /dashboard to role-specific dashboard
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      if (user.role.toLowerCase() === "admin") {
        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/user", request.url));
      }
    }

    // User dashboard routes are accessible to all authenticated users
    // (both regular users and admins can access user routes, but admin routes are protected)
  }

  // REDIRECT LOGGED-IN USERS FROM AUTH PAGES
  if (token && user) {
    if (pathname === "/login" || pathname === "/register") {
      if (user.role.toLowerCase() === "admin") {
        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/user", request.url));
      }
    }
  }

  // Allow request to proceed
  return NextResponse.next();
}

export const config = {
  // Match dashboard, login, and register routes
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
