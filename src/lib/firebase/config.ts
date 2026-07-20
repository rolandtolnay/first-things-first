export interface FirebasePublicConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing Firebase environment variable: ${name}`);
  return value;
}

export function getFirebaseConfig(): FirebasePublicConfig {
  return {
    apiKey: required("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: required(
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    ),
    projectId: required(
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    ),
    appId: required("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  };
}

export function usesFirebaseEmulators(): boolean {
  const enabled = process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === "true";
  if (enabled) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
    if (!projectId.startsWith("demo-")) {
      throw new Error("Firebase emulators require a demo-* project id");
    }
  }
  return enabled;
}
