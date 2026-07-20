"use client";

import { useEffect, useState, type FormEvent } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useRouter } from "next/navigation";

import { AppWindow } from "@/components/layout/AppWindow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseReturnPath } from "@/lib/auth-redirects";
import { EMAIL_FOR_SIGN_IN_KEY } from "@/lib/firebase/auth-constants";
import { emailLinkCompletionError } from "@/lib/firebase/auth-errors";
import { firebaseAuth } from "@/lib/firebase/client";
import { syncServerSession } from "@/lib/firebase/session-client";

type Status = "verifying" | "needs-email" | "error";

export default function ConfirmSignInPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verifying");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function finish(candidateEmail: string) {
    const auth = firebaseAuth();
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      throw new Error("That sign-in link is invalid or has expired. Please try again.");
    }
    const credential = await signInWithEmailLink(auth, candidateEmail.trim(), window.location.href);
    await syncServerSession(credential.user);
    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(parseReturnPath(next, window.location.origin));
    router.refresh();
  }

  useEffect(() => {
    const storedEmail = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
    if (!storedEmail) {
      setStatus("needs-email");
      return;
    }
    void finish(storedEmail).catch((error) => {
      setErrorMessage(emailLinkCompletionError(error));
      setStatus("error");
    });
    // This effect deliberately consumes the loaded link only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setStatus("verifying");
    setErrorMessage(null);
    try {
      await finish(email);
    } catch (error) {
      setErrorMessage(emailLinkCompletionError(error));
      setStatus("error");
    }
  }

  return (
    <AppWindow>
      <header className="flex shrink-0 items-center gap-2 px-4 py-3">
        <span aria-hidden={true} className="size-3.5 rounded-[5px] bg-primary" />
        <span className="text-[13px] font-semibold tracking-tight text-foreground">
          First Things First
        </span>
      </header>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {status === "verifying" ? (
            <p className="text-sm text-muted-foreground">Signing you in…</p>
          ) : (
            <form onSubmit={submitEmail} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  Confirm your email
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter the email address that received this sign-in link.
                </p>
              </div>
              <Input
                type="email"
                autoComplete="email"
                required={true}
                autoFocus={true}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              {errorMessage && (
                <p className="rounded-md bg-warning-soft px-3 py-2 text-caption" role="alert">
                  {errorMessage}
                </p>
              )}
              <Button type="submit" disabled={!email.trim()}>
                Continue
              </Button>
            </form>
          )}
        </div>
      </div>
    </AppWindow>
  );
}
