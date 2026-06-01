"use client";

import {
  createContext,
  use,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type AppMenuKind = "dropdown" | "context";
type DropdownContentProps = ComponentProps<typeof DropdownMenuContent>;
type ContextContentProps = ComponentProps<typeof ContextMenuContent>;
type DropdownItemProps = ComponentProps<typeof DropdownMenuItem>;
type ContextItemProps = ComponentProps<typeof ContextMenuItem>;
type DropdownSubTriggerProps = ComponentProps<typeof DropdownMenuSubTrigger>;
type ContextSubTriggerProps = ComponentProps<typeof ContextMenuSubTrigger>;
type DropdownSubContentProps = ComponentProps<typeof DropdownMenuSubContent>;
type ContextSubContentProps = ComponentProps<typeof ContextMenuSubContent>;

type AppMenuItemVariant = "default" | "destructive";

type AppMenuItemBaseProps = {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  variant?: AppMenuItemVariant;
  disabled?: boolean;
  className?: string;
};

type AppMenuActionItemProps = AppMenuItemBaseProps &
  Omit<DropdownItemProps, "children" | "className" | "disabled" | "variant" | "inset"> &
  Omit<ContextItemProps, "children" | "className" | "disabled" | "variant" | "inset"> & {
    kind?: "item";
  };

type AppMenuSubTriggerItemProps = AppMenuItemBaseProps &
  Omit<DropdownSubTriggerProps, "children" | "className" | "disabled" | "inset" | "onSelect"> &
  Omit<ContextSubTriggerProps, "children" | "className" | "disabled" | "inset" | "onSelect"> & {
    kind: "subTrigger";
    onSelect?: never;
  };

type AppMenuItemProps = AppMenuActionItemProps | AppMenuSubTriggerItemProps;

type AppMenuSubContentProps = {
  children: ReactNode;
  className?: string;
} & Omit<DropdownSubContentProps, "children" | "className"> &
  Omit<ContextSubContentProps, "children" | "className">;

const AppMenuContentContext = createContext<AppMenuKind | null>(null);

const appMenuRowClass =
  "min-h-9 w-full gap-3 rounded-md px-2.5 py-2 text-[15px] leading-none text-foreground outline-none focus:bg-[var(--ds-hover-tint)] focus:text-foreground focus-visible:!outline-none data-open:bg-[var(--ds-hover-tint)] data-open:text-foreground [&>svg:last-child]:ml-auto [&>svg:last-child]:size-4 [&>svg:last-child]:shrink-0 [&>svg:last-child]:text-muted-foreground";
const appMenuDestructiveClass =
  "text-destructive focus:bg-destructive/10 focus:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:focus:bg-destructive/20";
const appMenuSubContentClass = "min-w-0";

function useAppMenuKind(componentName: string) {
  const kind = use(AppMenuContentContext);
  if (!kind) {
    throw new Error(
      `${componentName} must be used inside AppDropdownMenuContent or AppContextMenuContent.`
    );
  }
  return kind;
}

function getAppMenuRowClass(variant: AppMenuItemVariant, className?: string) {
  return cn(
    appMenuRowClass,
    variant === "destructive" && appMenuDestructiveClass,
    className
  );
}

function AppMenuItemContent({
  icon: Icon,
  children,
}: Pick<AppMenuItemBaseProps, "icon" | "children">) {
  return (
    <>
      <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 text-left">{children}</span>
    </>
  );
}

function getPrimitiveProps<T extends AppMenuItemProps>(props: T) {
  const primitiveProps = { ...props };
  const appProps = primitiveProps as Partial<AppMenuItemBaseProps & { kind: AppMenuItemProps["kind"] }>;

  delete appProps.icon;
  delete appProps.children;
  delete appProps.kind;
  delete appProps.variant;
  delete appProps.disabled;
  delete appProps.className;

  return primitiveProps as Omit<T, keyof AppMenuItemBaseProps | "kind">;
}

export function AppDropdownMenuContent({
  children,
  ...props
}: DropdownContentProps): React.JSX.Element {
  return (
    <DropdownMenuContent {...props}>
      <AppMenuContentContext.Provider value="dropdown">
        {children}
      </AppMenuContentContext.Provider>
    </DropdownMenuContent>
  );
}

export function AppContextMenuContent({
  children,
  ...props
}: ContextContentProps): React.JSX.Element {
  return (
    <ContextMenuContent {...props}>
      <AppMenuContentContext.Provider value="context">
        {children}
      </AppMenuContentContext.Provider>
    </ContextMenuContent>
  );
}

export function AppMenuItem(props: AppMenuItemProps): React.JSX.Element {
  const menuKind = useAppMenuKind("AppMenuItem");
  const {
    icon,
    children,
    variant = "default",
    disabled,
    className,
  } = props;
  const rowClassName = getAppMenuRowClass(variant, className);
  const content = <AppMenuItemContent icon={icon}>{children}</AppMenuItemContent>;

  if (props.kind === "subTrigger") {
    const subTriggerProps = getPrimitiveProps(props);

    if (menuKind === "dropdown") {
      return (
        <DropdownMenuSubTrigger
          disabled={disabled}
          className={rowClassName}
          {...subTriggerProps}
        >
          {content}
        </DropdownMenuSubTrigger>
      );
    }

    return (
      <ContextMenuSubTrigger
        disabled={disabled}
        className={rowClassName}
        {...subTriggerProps}
      >
        {content}
      </ContextMenuSubTrigger>
    );
  }

  const itemProps = getPrimitiveProps(props);

  if (menuKind === "dropdown") {
    return (
      <DropdownMenuItem
        variant={variant}
        disabled={disabled}
        className={rowClassName}
        {...itemProps}
      >
        {content}
      </DropdownMenuItem>
    );
  }

  return (
    <ContextMenuItem
      variant={variant}
      disabled={disabled}
      className={rowClassName}
      {...itemProps}
    >
      {content}
    </ContextMenuItem>
  );
}

export function AppMenuSub({ children }: { children: ReactNode }): React.JSX.Element {
  const menuKind = useAppMenuKind("AppMenuSub");

  return menuKind === "dropdown" ? (
    <DropdownMenuSub>{children}</DropdownMenuSub>
  ) : (
    <ContextMenuSub>{children}</ContextMenuSub>
  );
}

export function AppMenuSubContent({
  children,
  className,
  ...props
}: AppMenuSubContentProps): React.JSX.Element {
  const menuKind = useAppMenuKind("AppMenuSubContent");
  const subContentClassName = cn(appMenuSubContentClass, className);

  return menuKind === "dropdown" ? (
    <DropdownMenuSubContent className={subContentClassName} {...props}>{children}</DropdownMenuSubContent>
  ) : (
    <ContextMenuSubContent className={subContentClassName} {...props}>{children}</ContextMenuSubContent>
  );
}
