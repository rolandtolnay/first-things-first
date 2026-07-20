import { describe, expect, it } from "vitest";

import {
  buildAuthenticatedHomeUrl,
  buildLoginRedirectUrl,
  isPublicAuthPath,
  parseReturnPath,
} from "@/lib/auth-redirects";

const ORIGIN = "https://first-things-first.example";

describe("auth redirect boundaries", () => {
  it("preserves same-origin paths and queries", () => {
    expect(parseReturnPath("/week?focus=today", ORIGIN)).toBe("/week?focus=today");
    expect(parseReturnPath(`${ORIGIN}/week?focus=today`, ORIGIN)).toBe(
      "/week?focus=today",
    );
  });

  it.each([
    "https://attacker.example/steal",
    "//attacker.example/steal",
    "javascript:alert(1)",
    "week-without-a-leading-slash",
  ])("reduces unsafe return destinations to the app root: %s", (value) => {
    expect(parseReturnPath(value, ORIGIN)).toBe("/");
  });

  it("builds a login redirect without losing the private destination", () => {
    const redirect = buildLoginRedirectUrl(
      new URL(`${ORIGIN}/planner/week?panel=roles`),
    );

    expect(redirect.origin).toBe(ORIGIN);
    expect(redirect.pathname).toBe("/login");
    expect(redirect.searchParams.get("redirectTo")).toBe(
      "/planner/week?panel=roles",
    );
  });

  it("returns an authenticated login request only to a safe destination", () => {
    expect(
      buildAuthenticatedHomeUrl(
        new URL(`${ORIGIN}/login?redirectTo=%2Fweek%3Fpanel%3Droles`),
      ).href,
    ).toBe(`${ORIGIN}/week?panel=roles`);

    expect(
      buildAuthenticatedHomeUrl(
        new URL(`${ORIGIN}/login?redirectTo=https%3A%2F%2Fattacker.example`),
      ).href,
    ).toBe(`${ORIGIN}/`);
  });

  it("keeps only the login and Firebase session endpoints public", () => {
    expect(isPublicAuthPath("/login")).toBe(true);
    expect(isPublicAuthPath("/auth/confirm")).toBe(true);
    expect(isPublicAuthPath("/auth/session")).toBe(true);
    expect(isPublicAuthPath("/")).toBe(false);
    expect(isPublicAuthPath("/auth/session/extra")).toBe(false);
  });
});
