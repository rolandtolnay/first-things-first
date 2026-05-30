import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Bare by default; lights up on focus (hairline underline → accent).
        "w-full min-w-0 rounded-[var(--ds-r-xs)] bg-transparent px-1.5 py-1 text-sm outline-none",
        "border-0 border-b-[1.5px] border-border/0 transition-colors",
        "placeholder:text-muted-foreground",
        "focus:bg-foreground/5 focus:border-border focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      style={style}
      {...props}
    />
  )
}

export { Input }
