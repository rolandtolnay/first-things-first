import { Plus } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

type MockMenuProps = {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: "default" | "destructive";
  align?: "start" | "center" | "end";
  onCloseAutoFocus?: (event: Event) => void;
  onPointerDown?: React.PointerEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenuContent: ({
    children,
    align,
    onCloseAutoFocus,
    onPointerDown,
    onClick,
    ...props
  }: MockMenuProps) => (
    <div
      data-slot="dropdown-menu-content"
      data-align={align}
      data-has-on-close-auto-focus={onCloseAutoFocus ? "true" : undefined}
      data-has-on-pointer-down={onPointerDown ? "true" : undefined}
      data-has-on-click={onClick ? "true" : undefined}
      {...props}
    >
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, variant = "default", ...props }: MockMenuProps) => (
    <div data-slot="dropdown-menu-item" data-variant={variant} {...props}>{children}</div>
  ),
  DropdownMenuSub: ({ children }: MockMenuProps) => (
    <div data-slot="dropdown-menu-sub">{children}</div>
  ),
  DropdownMenuSubContent: ({ children, ...props }: MockMenuProps) => (
    <div data-slot="dropdown-menu-sub-content" {...props}>{children}</div>
  ),
  DropdownMenuSubTrigger: ({ children, ...props }: MockMenuProps) => (
    <div data-slot="dropdown-menu-sub-trigger" {...props}>{children}</div>
  ),
}));

vi.mock("@/components/ui/context-menu", () => ({
  ContextMenuContent: ({
    children,
    onCloseAutoFocus,
    onPointerDown,
    onClick,
    ...props
  }: MockMenuProps) => (
    <div
      data-slot="context-menu-content"
      data-has-on-close-auto-focus={onCloseAutoFocus ? "true" : undefined}
      data-has-on-pointer-down={onPointerDown ? "true" : undefined}
      data-has-on-click={onClick ? "true" : undefined}
      {...props}
    >
      {children}
    </div>
  ),
  ContextMenuItem: ({ children, variant = "default", ...props }: MockMenuProps) => (
    <div data-slot="context-menu-item" data-variant={variant} {...props}>{children}</div>
  ),
  ContextMenuSub: ({ children }: MockMenuProps) => (
    <div data-slot="context-menu-sub">{children}</div>
  ),
  ContextMenuSubContent: ({ children, ...props }: MockMenuProps) => (
    <div data-slot="context-menu-sub-content" {...props}>{children}</div>
  ),
  ContextMenuSubTrigger: ({ children, ...props }: MockMenuProps) => (
    <div data-slot="context-menu-sub-trigger" {...props}>{children}</div>
  ),
}));

import {
  AppContextMenuContent,
  AppDropdownMenuContent,
  AppMenuItem,
  AppMenuSub,
  AppMenuSubContent,
} from "@/components/ui/app-menu";

function renderMarkup(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("AppMenu", () => {
  it("renders the same AppMenuItem API inside dropdown and context menu content", () => {
    const dropdownMarkup = renderMarkup(
      <AppDropdownMenuContent>
        <AppMenuItem icon={Plus}>Add goal</AppMenuItem>
      </AppDropdownMenuContent>
    );
    const contextMarkup = renderMarkup(
      <AppContextMenuContent>
        <AppMenuItem icon={Plus}>Add goal</AppMenuItem>
      </AppContextMenuContent>
    );

    expect(dropdownMarkup).toContain('data-slot="dropdown-menu-item"');
    expect(contextMarkup).toContain('data-slot="context-menu-item"');
    expect(dropdownMarkup).toContain("Add goal");
    expect(contextMarkup).toContain("Add goal");
  });

  it("renders normal rows and submenu trigger rows through AppMenuItem", () => {
    const dropdownMarkup = renderMarkup(
      <AppDropdownMenuContent>
        <AppMenuItem icon={Plus}>Add goal</AppMenuItem>
        <AppMenuItem icon={Plus} kind="subTrigger">Change color</AppMenuItem>
      </AppDropdownMenuContent>
    );
    const contextMarkup = renderMarkup(
      <AppContextMenuContent>
        <AppMenuItem icon={Plus}>Add goal</AppMenuItem>
        <AppMenuItem icon={Plus} kind="subTrigger">Change color</AppMenuItem>
      </AppContextMenuContent>
    );

    expect(dropdownMarkup).toContain('data-slot="dropdown-menu-item"');
    expect(dropdownMarkup).toContain('data-slot="dropdown-menu-sub-trigger"');
    expect(contextMarkup).toContain('data-slot="context-menu-item"');
    expect(contextMarkup).toContain('data-slot="context-menu-sub-trigger"');
  });

  it("applies the app row layout, disabled state, destructive variant, and submenu chevron", () => {
    const markup = renderMarkup(
      <AppDropdownMenuContent>
        <AppMenuItem icon={Plus} variant="destructive" disabled>
          Archive role
        </AppMenuItem>
        <AppMenuItem icon={Plus} kind="subTrigger">
          Change color
        </AppMenuItem>
      </AppDropdownMenuContent>
    );

    expect(markup).toContain('data-variant="destructive"');
    expect(markup).toContain("disabled");
    expect(markup).toContain("min-h-9");
    expect(markup).toContain("gap-3");
    expect(markup).toContain("focus:bg-[var(--ds-hover-tint)]");
    expect(markup).toContain("data-open:bg-[var(--ds-hover-tint)]");
    expect(markup).toContain("text-destructive");
    expect(markup).toContain("flex size-5 shrink-0 items-center justify-center");
    expect(markup).toContain("size-4");
    expect(markup).toContain("svg:last-child]:ml-auto");
    expect(markup).toContain("svg:last-child]:text-muted-foreground");
  });

  it("renders submenu primitives based on the nearest app menu content", () => {
    const dropdownMarkup = renderMarkup(
      <AppDropdownMenuContent>
        <AppMenuSub>
          <AppMenuItem icon={Plus} kind="subTrigger">Change color</AppMenuItem>
          <AppMenuSubContent className="p-2">Picker</AppMenuSubContent>
        </AppMenuSub>
      </AppDropdownMenuContent>
    );
    const contextMarkup = renderMarkup(
      <AppContextMenuContent>
        <AppMenuSub>
          <AppMenuItem icon={Plus} kind="subTrigger">Change color</AppMenuItem>
          <AppMenuSubContent className="p-2">Picker</AppMenuSubContent>
        </AppMenuSub>
      </AppContextMenuContent>
    );

    expect(dropdownMarkup).toContain('data-slot="dropdown-menu-sub"');
    expect(dropdownMarkup).toContain('data-slot="dropdown-menu-sub-content"');
    expect(contextMarkup).toContain('data-slot="context-menu-sub"');
    expect(contextMarkup).toContain('data-slot="context-menu-sub-content"');
  });

  it("passes current content behavior props through to the underlying menu content", () => {
    const noop = () => undefined;
    const dropdownMarkup = renderMarkup(
      <AppDropdownMenuContent
        align="end"
        className="min-w-36"
        onCloseAutoFocus={noop}
        onPointerDown={noop}
        onClick={noop}
      >
        <AppMenuItem icon={Plus}>Add goal</AppMenuItem>
      </AppDropdownMenuContent>
    );
    const contextMarkup = renderMarkup(
      <AppContextMenuContent className="min-w-36" onPointerDown={noop} onClick={noop}>
        <AppMenuItem icon={Plus}>Add goal</AppMenuItem>
      </AppContextMenuContent>
    );

    expect(dropdownMarkup).toContain('data-align="end"');
    expect(dropdownMarkup).toContain('class="min-w-36"');
    expect(dropdownMarkup).toContain('data-has-on-close-auto-focus="true"');
    expect(dropdownMarkup).toContain('data-has-on-pointer-down="true"');
    expect(dropdownMarkup).toContain('data-has-on-click="true"');
    expect(contextMarkup).toContain('class="min-w-36"');
    expect(contextMarkup).toContain('data-has-on-pointer-down="true"');
    expect(contextMarkup).toContain('data-has-on-click="true"');
  });

  it("throws a clear error when a row is rendered outside app menu content", () => {
    expect(() => renderMarkup(<AppMenuItem icon={Plus}>Add goal</AppMenuItem>)).toThrow(
      "AppMenuItem must be used inside AppDropdownMenuContent or AppContextMenuContent."
    );
  });
});
