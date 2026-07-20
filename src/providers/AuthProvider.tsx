"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onIdTokenChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { firebaseAuth } from "@/lib/firebase/client";
import { clearServerSession, syncServerSession } from "@/lib/firebase/session-client";
import { weekPersistence } from "@/stores/weekPersistence";
import { useWeekStore } from "@/stores/weekStore";

interface AuthContextValue {
  /** The signed-in User, or null while signed out / before the first auth event. */
  user: User | null;
  /** Flushes planning writes, then clears both Firebase and server Sessions. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

/**
 * Mirrors Firebase Auth into the planner store. The Next.js proxy has already
 * verified the HttpOnly Session cookie before this private layout renders.
 * Token refreshes resynchronize that cookie without re-bootstrapping the same
 * User; User changes reset the session-scoped persistence generation.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [auth] = useState(() => firebaseAuth());
  const router = useRouter();
  const bootstrap = useWeekStore((state) => state.bootstrap);
  const reset = useWeekStore((state) => state.reset);

  const leavePrivateShell = useCallback(() => {
    reset();
    router.replace("/login");
    router.refresh();
  }, [reset, router]);

  useEffect(() => {
    let bootstrappedUserId: string | null = null;
    let ownerGeneration = 0;
    let bootstrapTimer: ReturnType<typeof setTimeout> | null = null;

    function cancelBootstrap() {
      if (bootstrapTimer) {
        clearTimeout(bootstrapTimer);
        bootstrapTimer = null;
      }
    }

    const unsubscribe = onIdTokenChanged(auth, (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        ownerGeneration += 1;
        bootstrappedUserId = null;
        cancelBootstrap();
        void clearServerSession().finally(leavePrivateShell);
        return;
      }

      if (bootstrappedUserId === nextUser.uid) {
        void syncServerSession(nextUser).catch(leavePrivateShell);
        return;
      }

      ownerGeneration += 1;
      const generation = ownerGeneration;
      bootstrappedUserId = nextUser.uid;
      reset();
      cancelBootstrap();
      bootstrapTimer = setTimeout(async () => {
        bootstrapTimer = null;
        if (generation !== ownerGeneration || bootstrappedUserId !== nextUser.uid) return;
        try {
          await syncServerSession(nextUser);
          if (generation === ownerGeneration && bootstrappedUserId === nextUser.uid) {
            await bootstrap();
          }
        } catch {
          if (generation === ownerGeneration) leavePrivateShell();
        }
      }, 0);
    });

    return () => {
      ownerGeneration += 1;
      cancelBootstrap();
      unsubscribe();
    };
  }, [auth, bootstrap, reset, leavePrivateShell]);

  const signOut = useCallback(async () => {
    await weekPersistence.flush();
    await firebaseSignOut(auth);
    await clearServerSession();
    leavePrivateShell();
  }, [auth, leavePrivateShell]);

  return <AuthContext.Provider value={{ user, signOut }}>{children}</AuthContext.Provider>;
}
