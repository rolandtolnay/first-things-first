import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore/lite";

import { getFirebaseConfig, usesFirebaseEmulators } from "@/lib/firebase/config";

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

export function firebaseApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = getApps()[0] ?? initializeApp(getFirebaseConfig());
  }
  return appInstance;
}

export function firebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(firebaseApp());
    if (usesFirebaseEmulators()) {
      connectAuthEmulator(authInstance, "http://127.0.0.1:9099", {
        disableWarnings: true,
      });
    }
  }
  return authInstance;
}

export function firestoreDb(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(firebaseApp());
    if (usesFirebaseEmulators()) {
      connectFirestoreEmulator(firestoreInstance, "127.0.0.1", 8080);
    }
  }
  return firestoreInstance;
}
