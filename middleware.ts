import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece /admin ile başlayan rotaları kontrol et
  if (pathname.startsWith("/admin")) {
    // /admin/login sayfasını hariç tut
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // admin_session cookie'sini kontrol et
    const adminSession = request.cookies.get("admin_session");

    // Cookie yoksa veya değeri geçersizse login'e yönlendir
    if (!adminSession || !adminSession.value) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Cookie geçerliyse devam et
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Middleware'in çalışacağı rotaları belirt
export const config = {
  matcher: "/admin/:path*",
};
