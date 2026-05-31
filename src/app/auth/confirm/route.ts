import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import {
  buildLoginErrorPath,
  isEmailOtpType,
  parseReturnPath,
} from "@/lib/auth-redirects";
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
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  if (tokenHash && isEmailOtpType(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      redirect(parseReturnPath(next, origin));
    }
    redirect(buildLoginErrorPath(error.message));
  }

  redirect(buildLoginErrorPath("That sign-in link is invalid or has expired. Please try again."));
}
