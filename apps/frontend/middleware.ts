import { auth } from "./lib/auth/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // Public routes
  if (pathname.startsWith("/auth/")) {
    if (isLoggedIn) {
      // Redirect logged-in users away from auth pages
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // Protected routes - require authentication
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  // Role-based route protection
  if (pathname.startsWith("/dashboard") && userRole !== "MANAGER") {
    return NextResponse.redirect(new URL("/tickets", req.url))
  }

  if (pathname.startsWith("/categories") && userRole !== "MANAGER") {
    return NextResponse.redirect(new URL("/tickets", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
