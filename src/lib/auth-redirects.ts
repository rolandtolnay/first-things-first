import type { EmailOtpType } from "@supabase/supabase-js";

const DEFAULT_RETURN_PATH = "/";
const LOGIN_PATH = "/login";

/** Paths reachable without a Session: the login screen and auth callbacks. */
export function isPublicAuthPath(pathname: string): boolean {
  return pathname === LOGIN_PATH || pathname === "/auth/confirm";
}

/** Supabase magic-link callbacks in this app only use the email OTP flow. */
export function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value === "email";
}

/**
 * Normalize an intended post-auth destination to a same-origin path + query.
 * Rejects off-origin, protocol-relative, malformed, and empty values.
 */
export function parseReturnPath(value: string | null, origin: string): string {
  if (!value) return DEFAULT_RETURN_PATH;

  try {
    const url = new URL(value, origin);
    if (url.origin !== origin) return DEFAULT_RETURN_PATH;
    if (!value.startsWith("/") && !value.startsWith(origin)) {
      return DEFAULT_RETURN_PATH;
    }
    return `${url.pathname}${url.search}` || DEFAULT_RETURN_PATH;
  } catch {
    return DEFAULT_RETURN_PATH;
  }
}

/** Build the `/login` redirect for a private request, preserving path + query. */
export function buildLoginRedirectUrl(requestUrl: URL): URL {
  const url = new URL(requestUrl);
  const returnPath = parseReturnPath(
    `${requestUrl.pathname}${requestUrl.search}`,
    requestUrl.origin,
  );
  url.pathname = LOGIN_PATH;
  url.search = "";
  url.searchParams.set("redirectTo", returnPath);
  return url;
}

/** Authenticated users have no reason to remain on the login route. */
export function buildAuthenticatedHomeUrl(requestUrl: URL): URL {
  const url = new URL(requestUrl);
  url.pathname = DEFAULT_RETURN_PATH;
  url.search = "";
  return url;
}

export function buildLoginErrorPath(message: string): string {
  return `${LOGIN_PATH}?error=${encodeURIComponent(message)}`;
}
