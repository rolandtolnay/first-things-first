import type { User } from "firebase/auth";

import type { SessionSyncResponse } from "@/lib/firebase/session-cookie";

export async function syncServerSession(user: User): Promise<SessionSyncResponse> {
  const idToken = await user.getIdToken();
  const response = await fetch("/auth/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) throw new Error("Failed to establish your session");
  return (await response.json()) as SessionSyncResponse;
}

export async function clearServerSession(): Promise<void> {
  const response = await fetch("/auth/session", { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to clear your session");
}
