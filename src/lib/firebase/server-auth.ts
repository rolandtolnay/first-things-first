import "server-only";

import { createRemoteJWKSet, jwtVerify } from "jose";

import { getFirebaseConfig, usesFirebaseEmulators } from "@/lib/firebase/config";

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export interface VerifiedFirebaseUser {
  uid: string;
  email: string | null;
  expiresAt: number;
}

function decodePayload(token: string): Record<string, unknown> {
  const part = token.split(".")[1];
  if (!part) throw new Error("Malformed Firebase ID token");
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as Record<
    string,
    unknown
  >;
}

async function verifyEmulatorToken(token: string): Promise<VerifiedFirebaseUser> {
  const { apiKey } = getFirebaseConfig();
  const response = await fetch(
    `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error("Invalid Firebase emulator token");
  const body = (await response.json()) as {
    users?: Array<{ localId?: string; email?: string }>;
  };
  const user = body.users?.[0];
  if (!user?.localId) throw new Error("Firebase emulator token has no User");
  const payload = decodePayload(token);
  const expiresAt =
    typeof payload.exp === "number" ? payload.exp : Math.floor(Date.now() / 1000) + 3600;
  return { uid: user.localId, email: user.email ?? null, expiresAt };
}

export async function verifyFirebaseIdToken(token: string): Promise<VerifiedFirebaseUser> {
  if (usesFirebaseEmulators()) return verifyEmulatorToken(token);

  const { projectId } = getFirebaseConfig();
  const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
    algorithms: ["RS256"],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  });

  const now = Math.floor(Date.now() / 1000);
  if (!payload.sub || payload.sub.length > 128) {
    throw new Error("Firebase token has no valid subject");
  }
  if (typeof payload.iat !== "number" || payload.iat > now) {
    throw new Error("Firebase token was issued in the future");
  }
  if (typeof payload.auth_time !== "number" || payload.auth_time > now) {
    throw new Error("Firebase authentication time is invalid");
  }
  if (typeof payload.exp !== "number") throw new Error("Firebase token has no expiry");

  return {
    uid: payload.sub,
    email: typeof payload.email === "string" ? payload.email : null,
    expiresAt: payload.exp,
  };
}
