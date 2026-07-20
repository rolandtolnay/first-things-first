import { NextResponse, type NextRequest } from "next/server";

import { usesFirebaseEmulators } from "@/lib/firebase/config";
import { verifyFirebaseIdToken } from "@/lib/firebase/server-auth";
import { SESSION_COOKIE_NAME } from "@/lib/firebase/session-cookie";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: !usesFirebaseEmulators(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { idToken?: unknown };
    if (typeof body.idToken !== "string" || !body.idToken) {
      return NextResponse.json({ error: "Missing Firebase ID token" }, { status: 400 });
    }

    const user = await verifyFirebaseIdToken(body.idToken);
    const maxAge = Math.max(1, user.expiresAt - Math.floor(Date.now() / 1000));
    const response = NextResponse.json({ uid: user.uid, expiresAt: user.expiresAt });
    response.cookies.set(SESSION_COOKIE_NAME, body.idToken, cookieOptions(maxAge));
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid Firebase ID token" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", cookieOptions(0));
  return response;
}
