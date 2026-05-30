import { ReactNode } from "react";

interface AppWindowProps {
  children: ReactNode;
}

/**
 * AppWindow — the floating workspace window.
 *
 * A max-width, rounded, hairline-bordered frame with the kit window shadow,
 * sitting on the darker stage (body = --ds-stage) with the signature amber glow
 * (body::before) bleeding up behind it. `z-[1]` lifts the window above the fixed
 * glow layer; the inner column fills the viewport minus the stage padding so the
 * surfaces inside scroll on their own.
 */
export function AppWindow({ children }: AppWindowProps) {
  return (
    <div className="relative z-[1] min-h-screen p-6">
      <div className="relative mx-auto flex h-[calc(100vh-3rem)] w-full max-w-[1680px] flex-col overflow-hidden rounded-[var(--ds-r-lg)] border border-border bg-background shadow-[var(--ds-window-shadow)]">
        {children}
      </div>
    </div>
  );
}
