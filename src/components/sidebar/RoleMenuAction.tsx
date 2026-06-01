"use client";

import type { ComponentType, ReactNode } from "react";
import {
  ContextMenuItem,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenuItem,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type RoleMenuActionVariant = "default" | "destructive";

interface RoleMenuActionProps {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  variant?: RoleMenuActionVariant;
  className?: string;
}

type RoleMenuItemProps = RoleMenuActionProps & {
  onSelect?: (event: Event) => void;
};

const roleMenuActionClass =
  "min-h-9 w-full gap-3 rounded-md px-2.5 py-2 text-[15px] leading-none outline-none focus:bg-[var(--ds-hover-tint)] focus:text-foreground focus-visible:!outline-none data-open:bg-[var(--ds-hover-tint)] data-open:text-foreground";
const destructiveClass =
  "text-destructive focus:bg-destructive/10 focus:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:focus:bg-destructive/20";

function RoleMenuActionContent({
  icon: Icon,
  children,
}: Pick<RoleMenuActionProps, "icon" | "children">) {
  return (
    <>
      <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 text-left">{children}</span>
    </>
  );
}

function getRoleMenuActionClass(variant: RoleMenuActionVariant, className?: string) {
  return cn(
    roleMenuActionClass,
    variant === "destructive" && destructiveClass,
    className,
  );
}

export function RoleDropdownMenuItem({
  icon,
  children,
  variant = "default",
  className,
  ...props
}: RoleMenuItemProps) {
  return (
    <DropdownMenuItem
      variant={variant}
      className={getRoleMenuActionClass(variant, className)}
      {...props}
    >
      <RoleMenuActionContent icon={icon}>{children}</RoleMenuActionContent>
    </DropdownMenuItem>
  );
}

export function RoleDropdownMenuSubTrigger({
  icon,
  children,
  variant = "default",
  className,
}: RoleMenuActionProps) {
  return (
    <DropdownMenuSubTrigger className={getRoleMenuActionClass(variant, className)}>
      <RoleMenuActionContent icon={icon}>{children}</RoleMenuActionContent>
    </DropdownMenuSubTrigger>
  );
}

export function RoleContextMenuItem({
  icon,
  children,
  variant = "default",
  className,
  ...props
}: RoleMenuItemProps) {
  return (
    <ContextMenuItem
      variant={variant}
      className={getRoleMenuActionClass(variant, className)}
      {...props}
    >
      <RoleMenuActionContent icon={icon}>{children}</RoleMenuActionContent>
    </ContextMenuItem>
  );
}

export function RoleContextMenuSubTrigger({
  icon,
  children,
  variant = "default",
  className,
}: RoleMenuActionProps) {
  return (
    <ContextMenuSubTrigger className={getRoleMenuActionClass(variant, className)}>
      <RoleMenuActionContent icon={icon}>{children}</RoleMenuActionContent>
    </ContextMenuSubTrigger>
  );
}
