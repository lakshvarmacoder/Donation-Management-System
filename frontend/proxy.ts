import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "dms_session"
const LOGIN_PATH = "/admin/login"

export function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl

  if (pathname.startsWith("/admin") && !pathname.startsWith(LOGIN_PATH)) {
    const hasSession = request.cookies.has(COOKIE_NAME)
    if (!hasSession) {
      return NextResponse.redirect(new URL(LOGIN_PATH, origin))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/admin/:path*",
}
