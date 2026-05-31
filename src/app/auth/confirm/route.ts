import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link confirmation endpoint (token-hash flow).
 *
 * The Magic Link email template points here:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}
 *
 * We verify the token-hash to mint a Session (cookies are set by the server
 * client), then redirect to `next` (the page the user was heading to) — or back
 * to /login with a recoverable error if the link is invalid or expired.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      redirect(safeNext(next, origin));
    }
    redirect(loginError(error.message));
  }

  redirect(loginError("That sign-in link is invalid or has expired. Please try again."));
}

/**
 * Resolve `next` to a same-origin path, guarding against open redirects. The
 * redirect allow-list already constrains it, but a stray off-origin value falls
 * back to the app root rather than bouncing the user off-site.
 */
function safeNext(next: string | null, origin: string): string {
  if (!next) return "/";
  try {
    const url = new URL(next, origin);
    if (url.origin !== origin) return "/";
    return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
}

function loginError(message: string): string {
  return `/login?error=${encodeURIComponent(message)}`;
}
