import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/adminCookie";

// Легка перевірка на рівні Edge — лише наявність cookie, для швидкого
// редіректу на логін. Строга (криптографічна) перевірка значення
// відбувається в Node-шарі: на сторінці /admin і в server actions
// (src/lib/adminAuth.ts), яким middleware довіряти не може підмінити.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const hasCookie = Boolean(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
    if (!hasCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
