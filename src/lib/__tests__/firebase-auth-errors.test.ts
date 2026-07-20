import { describe, expect, it } from "vitest";

import {
  emailLinkCompletionError,
  emailLinkSendError,
} from "@/lib/firebase/auth-errors";

describe("Firebase auth errors", () => {
  it("turns invalid and expired action codes into recoverable customer copy", () => {
    expect(emailLinkCompletionError({ code: "auth/invalid-action-code" })).toContain(
      "Request a new link",
    );
    expect(emailLinkCompletionError({ code: "auth/expired-action-code" })).toContain(
      "expired",
    );
  });

  it("does not expose unknown provider text", () => {
    expect(
      emailLinkCompletionError(new Error("Firebase: sensitive provider detail")),
    ).toBe("Unable to complete sign-in. Request a new link and try again.");
    expect(emailLinkSendError(new Error("Firebase: sensitive provider detail"))).toBe(
      "Unable to send a sign-in link. Please try again.",
    );
  });

  it("preserves the app's own timeout guidance", () => {
    const message = "The sign-in service did not respond. Check your connection and try again.";
    expect(emailLinkSendError(new Error(message))).toBe(message);
  });
});
