import { NextResponse, type NextRequest } from "next/server"

// Lightweight middleware: only checks for the presence of a Supabase auth cookie
// to make routing decisions. Real session validation happens in the page layouts
// via getCurrentUser() which calls supabase.auth.getUser().
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth")
  const isPublicRoute = pathname === "/" || isAuthRoute

  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token") && c.value.length > 0)

  if (!hasAuthCookie && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (hasAuthCookie && isAuthRoute && !pathname.startsWith("/api/auth")) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
