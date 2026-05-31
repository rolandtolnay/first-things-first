import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-[var(--ds-r-sm)] border border-[var(--ds-line)] bg-[var(--ds-panel)] px-3 py-1 text-sm text-foreground outline-none transition-[background-color,border-color,box-shadow]",
        "placeholder:text-muted-foreground/70",
        "focus:border-[var(--ds-line-strong)] focus:bg-[var(--ds-panel-2)] focus-visible:ring-[3px] focus-visible:ring-ring/30",
        "aria-invalid:border-destructive/70 aria-invalid:focus:border-destructive aria-invalid:focus-visible:ring-destructive/20",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      style={style}
      {...props}
    />
  )
}

function InlineInput({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="inline-input"
      className={cn(
        // Calm inline editor: transparent at rest, subtle neutral rectangle on focus.
        "h-6 w-full min-w-0 rounded-[var(--ds-r-xs)] bg-transparent px-2 py-0 text-sm leading-5 outline-none",
        "border border-transparent transition-[background-color,border-color,box-shadow]",
        "placeholder:text-muted-foreground/70",
        "focus:bg-[var(--ds-panel-2)] focus:border-[var(--ds-line-strong)]",
        "focus-visible:!outline-none focus-visible:ring-0 focus-visible:shadow-none",
        "aria-invalid:border-destructive/70 aria-invalid:focus:border-destructive aria-invalid:focus-visible:ring-[3px] aria-invalid:focus-visible:ring-destructive/20",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      style={style}
      {...props}
    />
  )
}

export { Input, InlineInput }
