"use client";

import { useEffect, useState, type FormEvent } from "react";
import { onAuthStateChanged, sendSignInLinkToEmail } from "firebase/auth";
import { MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { AppWindow } from "@/components/layout/AppWindow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextActionButton } from "@/components/ui/TextActionButton";
import { parseReturnPath } from "@/lib/auth-redirects";
import { EMAIL_FOR_SIGN_IN_KEY } from "@/lib/firebase/auth-constants";
import { emailLinkSendError } from "@/lib/firebase/auth-errors";
import { firebaseAuth } from "@/lib/firebase/client";
import { syncServerSession } from "@/lib/firebase/session-client";

/**
 * Login surface — a small state machine:
 *
 *   entry ──submit──▶ sending ──ok───▶ sent ("check your email")
 *     ▲                   └──error──▶ error ──retry──▶ entry
 *
 * Rendered outside the authenticated shell: it wears the AppWindow frame with a
 * minimal brand header (no Window Chrome — there's no session to sign out of or
 * settings to open while logged out). Composed from shared primitives + tokens.
 */
type Status = "entry" | "sending" | "sent" | "error";

async function withResponseTimeout<T>(operation: Promise<T>, timeoutMs = 12_000): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("The sign-in service did not respond. Check your connection and try again.")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("entry");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // A failed /auth/confirm bounces back here with ?error=… — surface it.
  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    if (error) {
      setErrorMessage(error);
      setStatus("error");
    }
  }, []);

  // A valid Firebase browser Session can outlive the short-lived server cookie.
  // Re-synchronize it here instead of making the User request another email.
  useEffect(() => {
    return onAuthStateChanged(firebaseAuth(), (user) => {
      if (!user) return;
      void syncServerSession(user).then(() => {
        const requested = new URLSearchParams(window.location.search).get("redirectTo");
        router.replace(parseReturnPath(requested, window.location.origin));
        router.refresh();
      });
    });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("sending");
    setErrorMessage(null);

    const redirectTo = new URLSearchParams(window.location.search).get("redirectTo");
    const next = parseReturnPath(redirectTo, window.location.origin);
    const continueUrl = new URL("/auth/confirm", window.location.origin);
    continueUrl.searchParams.set("next", next);

    try {
      await withResponseTimeout(
        sendSignInLinkToEmail(firebaseAuth(), trimmed, {
          url: continueUrl.toString(),
          handleCodeInApp: true,
        }),
      );
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, trimmed);
      setStatus("sent");
    } catch (error) {
      setErrorMessage(emailLinkSendError(error));
      setStatus("error");
    }
  }

  const isSending = status === "sending";

  return (
    <AppWindow>
      <header className="flex shrink-0 items-center gap-2 px-4 py-3">
        <span
          aria-hidden={true}
          className="size-3.5 rounded-[5px] bg-primary shadow-[0_0_10px_var(--ds-accent-soft)]"
        />
        <span className="text-[13px] font-semibold tracking-tight text-foreground">
          First Things First
        </span>
      </header>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {status === "sent" ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft">
                <MailCheck className="size-5 text-primary" strokeWidth={1.4} />
              </span>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Check your email
              </h1>
              <p className="text-sm text-muted-foreground">
                We sent a magic link to{" "}
                <span className="text-secondary-foreground">{email.trim()}</span>.
                Click it to sign in.
              </p>
              <TextActionButton
                className="mt-1"
                onClick={() => {
                  setStatus("entry");
                  setErrorMessage(null);
                }}
              >
                Use a different email
              </TextActionButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  Sign in
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send you a magic link — no
                  password needed.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="font-mono text-label uppercase tracking-[0.12em] text-muted-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus={true}
                  required={true}
                  placeholder="you@example.com"
                  value={email}
                  disabled={isSending}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              {status === "error" && errorMessage && (
                <p
                  className="rounded-md bg-warning-soft px-3 py-2 text-caption text-secondary-foreground"
                  style={{ borderLeft: "3px solid var(--warning)" }}
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}

              <Button type="submit" disabled={isSending || email.trim().length === 0}>
                {isSending ? "Sending…" : "Send magic link"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </AppWindow>
  );
}
