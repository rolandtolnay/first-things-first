import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  buildAuthenticatedHomeUrl,
  buildLoginRedirectUrl,
  isPublicAuthPath,
} from "@/lib/auth-redirects";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Refreshes the Supabase session cookie on every matched request and gates
 * routes: unauthenticated requests to a private path are redirected to /login
 * (preserving where they were headed), and an authenticated visit to /login is
 * sent on to the app. Static assets are already excluded by the matcher.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, publishableKey } = getSupabaseConfig();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: do not run code between creating the client and getUser().
  // getUser() revalidates and refreshes the token; interleaving other logic
  // here causes hard-to-debug session drop-outs.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // No Session on a private path → send to /login, remembering the target so the
  // magic link can return the user there.
  if (!user && !isPublicAuthPath(pathname)) {
    return NextResponse.redirect(buildLoginRedirectUrl(request.nextUrl));
  }

  // Already signed in but sitting on /login → nothing to do there.
  if (user && pathname === "/login") {
    return NextResponse.redirect(buildAuthenticatedHomeUrl(request.nextUrl));
  }

  return supabaseResponse;
}
