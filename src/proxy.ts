import { NextResponse, type NextRequest } from "next/server";

import {
  buildAuthenticatedHomeUrl,
  buildLoginRedirectUrl,
  isPublicAuthPath,
} from "@/lib/auth-redirects";
import { verifyFirebaseIdToken } from "@/lib/firebase/server-auth";
import { SESSION_COOKIE_NAME } from "@/lib/firebase/session-cookie";

// Next.js 16 renamed the `middleware` convention to `proxy` (Node.js runtime).
// Firebase Auth persists in the browser; a verified HttpOnly ID-token cookie is
// the server-readable Session that gates private routes.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let signedIn = false;

  if (token) {
    try {
      await verifyFirebaseIdToken(token);
      signedIn = true;
    } catch {
      signedIn = false;
    }
  }

  const { pathname } = request.nextUrl;
  if (!signedIn && !isPublicAuthPath(pathname)) {
    const response = NextResponse.redirect(buildLoginRedirectUrl(request.nextUrl));
    if (token) response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  if (signedIn && pathname === "/login") {
    return NextResponse.redirect(buildAuthenticatedHomeUrl(request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - image asset files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
