"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { useWeekStore } from "@/stores/weekStore";

interface AuthContextValue {
  /** The signed-in User, or null while signed out / before the first auth event. */
  user: User | null;
  /** Clears the Session; auth-state broadcast then drops every tab to /login. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Access the current auth Session. Must be used under <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

/**
 * AuthProvider — replaces the removed DatabaseProvider in the root provider tree.
 *
 * Renders children immediately (route-gating is done server-side in middleware,
 * so the client never blocks on auth). It mirrors the Supabase Session via
 * onAuthStateChange and drives the week store's lifecycle:
 *   - a new signed-in User  → bootstrap() loads that user's Weeks
 *   - sign-out              → reset() clears the in-memory week state
 *
 * The auth-state subscription is also what makes sign-out multi-tab consistent:
 * supabase-js broadcasts SIGNED_OUT to every tab, each drops its store + the
 * next navigation is redirected to /login by middleware.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // One browser client for the provider's lifetime — created once via the
  // useState initializer so the subscription stays stable across renders.
  const [supabase] = useState(() => createClient());

  const bootstrap = useWeekStore((s) => s.bootstrap);
  const reset = useWeekStore((s) => s.reset);

  useEffect(() => {
    // Bootstrap exactly once per signed-in User. onAuthStateChange also fires on
    // every token refresh and tab focus with the same user — re-bootstrapping
    // then would clobber the user's current-week navigation, so gate on the id.
    let bootstrappedUserId: string | null = null;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        if (bootstrappedUserId !== nextUser.id) {
          bootstrappedUserId = nextUser.id;
          // Defer store work out of the auth callback — calling Supabase
          // (bootstrap reads the weeks table) synchronously inside it can
          // deadlock the auth client.
          setTimeout(() => {
            void bootstrap();
          }, 0);
        }
      } else {
        bootstrappedUserId = null;
        reset();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, bootstrap, reset]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
