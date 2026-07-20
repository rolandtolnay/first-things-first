export const SESSION_COOKIE_NAME = "ftf_firebase_session";

export interface SessionSyncResponse {
  uid: string;
  expiresAt: number;
}
