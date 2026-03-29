import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-none outline-none focus-visible:outline-none px-1 py-0.5 text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      style={{
        backgroundColor: "color-mix(in srgb, var(--foreground) 8%, transparent)",
        border: "none",
        borderBottom: "1.5px solid var(--muted-foreground)",
        outline: "none",
        ...style,
      }}
      {...props}
    />
  )
}

export { Input }
