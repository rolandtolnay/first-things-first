function errorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return null;
}

export function emailLinkCompletionError(error: unknown): string {
  switch (errorCode(error)) {
    case "auth/invalid-action-code":
    case "auth/expired-action-code":
      return "That sign-in link is invalid or has expired. Request a new link and try again.";
    case "auth/invalid-email":
      return "Enter the email address that received this sign-in link.";
    case "auth/user-disabled":
      return "This account can’t sign in. Contact support if you think this is a mistake.";
    case "auth/too-many-requests":
      return "Too many sign-in attempts. Wait a moment, then try again.";
    case "auth/network-request-failed":
      return "Couldn’t reach the sign-in service. Check your connection and try again.";
    default:
      return "Unable to complete sign-in. Request a new link and try again.";
  }
}

export function emailLinkSendError(error: unknown): string {
  switch (errorCode(error)) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many sign-in attempts. Wait a moment, then try again.";
    case "auth/network-request-failed":
      return "Couldn’t reach the sign-in service. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Email sign-in is not available right now. Please try again later.";
    default:
      return error instanceof Error && error.message.startsWith("The sign-in service")
        ? error.message
        : "Unable to send a sign-in link. Please try again.";
  }
}
