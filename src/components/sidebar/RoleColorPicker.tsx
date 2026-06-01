"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRoleColorStyle, ROLE_COLOR_OPTIONS } from "@/lib/role-colors";
import type { RoleColor } from "@/types";

interface RoleColorPickerProps {
  value: RoleColor;
  onChange: (color: RoleColor) => void;
}

export function RoleColorPicker({ value, onChange }: RoleColorPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5" aria-label="Role color choices">
      {ROLE_COLOR_OPTIONS.map((option) => {
        const selected = option.value === value;

        return (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={option.ariaLabel}
            aria-pressed={selected}
            className="size-8 rounded-full p-0 hover:bg-[var(--ds-line)]"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onChange(option.value);
            }}
          >
            <span
              className={cn(
                "relative flex size-6 items-center justify-center rounded-full shadow-sm ring-1 ring-foreground/15",
                selected && "ring-2 ring-ring ring-offset-1 ring-offset-popover",
              )}
              style={{ backgroundColor: getRoleColorStyle(option.value) }}
              aria-hidden="true"
            />
          </Button>
        );
      })}
    </div>
  );
}
