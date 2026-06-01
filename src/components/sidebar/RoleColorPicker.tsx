"use client";

import { Button } from "@/components/ui/button";
import { AppMenuItem } from "@/components/ui/app-menu";
import { cn } from "@/lib/utils";
import { getRoleColorStyle, ROLE_COLOR_OPTIONS } from "@/lib/role-colors";
import type { RoleColor } from "@/types";

interface RoleColorPickerProps {
  value: RoleColor;
  onChange: (color: RoleColor) => void;
  variant?: "grid" | "menu";
}

function RoleColorSwatch({ color, selected }: { color: RoleColor; selected: boolean }) {
  return (
    <span
      className={cn(
        "relative flex size-6 items-center justify-center rounded-full shadow-sm ring-1 ring-foreground/15",
        selected && "ring-2 ring-ring ring-offset-1 ring-offset-popover",
      )}
      style={{ backgroundColor: getRoleColorStyle(color) }}
      aria-hidden="true"
    />
  );
}

export function RoleColorPicker({ value, onChange, variant = "grid" }: RoleColorPickerProps) {
  if (variant === "menu") {
    return (
      <>
        {ROLE_COLOR_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <AppMenuItem
              key={option.value}
              leading={<RoleColorSwatch color={option.value} selected={selected} />}
              onSelect={() => onChange(option.value)}
            >
              {option.menuLabel}
            </AppMenuItem>
          );
        })}
      </>
    );
  }

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
            <RoleColorSwatch color={option.value} selected={selected} />
          </Button>
        );
      })}
    </div>
  );
}
