"use client";

import { useState, useRef, useEffect, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { MoreVertical, Check, CheckCircle, Circle, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AppContextMenuContent,
  AppDropdownMenuContent,
  AppMenuItem,
} from "@/components/ui/app-menu";
import { BlockMeta } from "@/components/ui/BlockMeta";
import { InlineInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { suppressBlockDraw } from "@/hooks/useBlockDraw";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
import type { RoleColor } from "@/types";

interface BlockCardProps {
  text: string;
  roleColor?: RoleColor;
  completed?: boolean;
  editable?: boolean;
  compact?: boolean;
  height?: number;
  autoEdit?: boolean;
  freestyle?: boolean;
  /** Calendar block with no role assignment; renders as transparent + dotted. */
  unassigned?: boolean;
  variant?: "default" | "card";
  roleTint?: "default" | "strong";
  roleBorder?: "accent" | "uniform";
  metaItems?: ReactNode[];
  leading?: ReactNode;
  hideCompletedIndicator?: boolean;
  menuLabel?: string;
  className?: string;
  style?: CSSProperties;
  onToggle?: () => void;
  onDelete?: () => void;
  onEdit?: (newText: string) => void;
}

export function BlockCard({
  text,
  roleColor,
  completed,
  editable,
  compact,
  height,
  autoEdit,
  freestyle,
  unassigned,
  variant = "default",
  roleTint = "default",
  roleBorder = "accent",
  metaItems,
  leading,
  hideCompletedIndicator = false,
  menuLabel = "Open block menu",
  className,
  style,
  onToggle,
  onDelete,
  onEdit,
}: BlockCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-edit for newly created freestyle blocks
  useEffect(() => {
    if (autoEdit) {
      setIsEditing(true);
      setEditValue("");
    }
  }, [autoEdit]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Sync text prop to edit value
  useEffect(() => {
    if (!isEditing) setEditValue(text);
  }, [text, isEditing]);

  // Blocks shorter than the meta-friendly height collapse to a single line and
  // hide their metadata.
  const SHORT_BLOCK_PX = 40;
  const isShort = height !== undefined && height < SHORT_BLOCK_PX;
  const lineClamp = isShort ? 1 : 2;
  const fontSize = compact ? "text-[11px]" : "text-[13px]";
  const padding = compact ? "px-2 py-1" : "px-2.5 py-2.5";

  const isCard = variant === "card";
  const isUnassignedCalendarBlock = unassigned && !isCard;

  const roleTintOpacity = roleTint === "strong"
    ? { rest: 0.2, hover: 0.24 }
    : { rest: 0.12, hover: 0.16 };

  const bgColor = isUnassignedCalendarBlock
    ? isHovered
      ? "color-mix(in oklab, var(--ds-panel-2), transparent 8%)"
      : "color-mix(in oklab, var(--ds-panel-2), transparent 24%)"
    : isCard
      ? "var(--card)"
      : roleColor
        ? getRoleColorStyleWithOpacity(
            roleColor,
            isHovered ? roleTintOpacity.hover : roleTintOpacity.rest
          )
        : completed
          ? "var(--completed-bg)"
          : "var(--muted)";

  const roleColorValue = roleColor ? getRoleColorStyle(roleColor) : undefined;
  const roleBorderColor = roleColorValue
    ? `color-mix(in oklab, ${roleColorValue}, transparent 65%)`
    : undefined;
  const borderStyle = freestyle ? "dashed" : "solid";
  const unassignedBorderColor = "var(--ds-fg-faint)";

  const hasMenu = (onToggle || onDelete) && !isEditing;

  function handleMenuInteraction() {
    suppressBlockDraw();
  }

  function handleMenuAction(action?: () => void) {
    suppressBlockDraw();
    action?.();
  }

  function handleDoubleClick() {
    if (editable && onEdit) {
      setIsEditing(true);
      setEditValue(text);
    }
  }

  function handleSave() {
    const trimmed = editValue.trim();
    if (!trimmed && freestyle && onDelete) {
      onDelete();
      setIsEditing(false);
      return;
    }
    if (trimmed && trimmed !== text) {
      onEdit?.(trimmed);
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      if (autoEdit) {
        const trimmed = editValue.trim();
        if (trimmed) {
          onEdit?.(trimmed);
        } else {
          onDelete?.();
        }
        setIsEditing(false);
        return;
      }
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (autoEdit) {
        onDelete?.();
      }
      setIsEditing(false);
    }
  }

  function handleBlur() {
    if (autoEdit) {
      const trimmed = editValue.trim();
      if (trimmed) {
        onEdit?.(trimmed);
      } else {
        onDelete?.();
      }
      setIsEditing(false);
      return;
    }
    handleSave();
  }

  function renderMenuItems() {
    return (
      <>
        {onToggle && (
          <AppMenuItem
            icon={completed ? Circle : CheckCircle}
            onSelect={() => handleMenuAction(onToggle)}
          >
            {completed ? "Mark incomplete" : "Mark complete"}
          </AppMenuItem>
        )}
        {onDelete && (
          <AppMenuItem
            icon={Trash2}
            variant="destructive"
            onSelect={() => handleMenuAction(onDelete)}
          >
            Delete
          </AppMenuItem>
        )}
      </>
    );
  }

  const cardContent = (
    <div
      className={cn(
        "group relative flex items-start gap-1.5 transition-[background-color,border-color,box-shadow]",
        isCard ? "rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)]" : "rounded-[6px]",
        !completed && !isCard && "shadow-sm hover:shadow-md",
        fontSize,
        padding,
        className
      )}
      style={{
        ...(height !== undefined && { height: `${height}px` }),
        backgroundColor: bgColor,
        borderTop: isUnassignedCalendarBlock
          ? `1px dotted ${unassignedBorderColor}`
          : roleBorderColor
            ? `1px ${borderStyle} ${roleBorderColor}`
            : undefined,
        borderRight: isUnassignedCalendarBlock
          ? `1px dotted ${unassignedBorderColor}`
          : roleBorderColor
            ? `1px ${borderStyle} ${roleBorderColor}`
            : undefined,
        borderBottom: isUnassignedCalendarBlock
          ? `1px dotted ${unassignedBorderColor}`
          : roleBorderColor
            ? `1px ${borderStyle} ${roleBorderColor}`
            : undefined,
        borderLeft: isUnassignedCalendarBlock
          ? `1px dotted ${unassignedBorderColor}`
          : roleBorderColor
            ? roleBorder === "uniform"
              ? `1px ${borderStyle} ${roleBorderColor}`
              : `3px solid ${roleColorValue}`
            : undefined,
        opacity: completed ? "var(--completed-opacity)" : undefined,
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {leading && !isEditing && leading}

      {/* Text or editing input */}
      {isEditing ? (
        <InlineInput
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 font-semibold"
          style={{ fontSize: "inherit", lineHeight: "1.4" }}
          placeholder={autoEdit ? "Block title..." : ""}
        />
      ) : (
        <div className={cn("flex-1 min-w-0", (hasMenu || completed) && "pr-5")}>
          <span
            className="font-semibold overflow-hidden block"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: lineClamp,
              WebkitBoxOrient: "vertical",
              lineHeight: "1.4",
              textDecoration: completed ? "line-through" : undefined,
              textDecorationColor: completed ? "var(--muted-foreground)" : undefined,
            }}
          >
            {text}
          </span>
          {metaItems && !isShort && (
            <BlockMeta items={metaItems} className="mt-1" />
          )}
        </div>
      )}

      {/* Completed indicator — top-right, aligned with text */}
      {completed && !isEditing && !hideCompletedIndicator && (
        <Check
          className="absolute right-2 text-primary group-hover:opacity-0 transition-opacity"
          style={{ top: compact ? "0.35rem" : "0.75rem" }}
          size={14}
          strokeWidth={3}
        />
      )}

      {/* Menu button — top-right */}
      {hasMenu && !isEditing && (
        <DropdownMenu onOpenChange={(open) => { if (!open) suppressBlockDraw(); }}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "absolute right-0.5 p-1 rounded hover:bg-black/10 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity",
                compact ? "top-0" : "top-2"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuInteraction();
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                handleMenuInteraction();
              }}
              onDoubleClick={(e) => e.stopPropagation()}
              aria-label={menuLabel}
            >
              <MoreVertical className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <AppDropdownMenuContent
            align="start"
            className="w-auto min-w-36"
            onPointerDown={(e) => {
              e.stopPropagation();
              handleMenuInteraction();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {renderMenuItems()}
          </AppDropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  // Wrap with ContextMenu if there are menu actions
  if (hasMenu) {
    return (
      <ContextMenu onOpenChange={(open) => { if (!open) suppressBlockDraw(); }}>
        <ContextMenuTrigger asChild>
          {cardContent}
        </ContextMenuTrigger>
        <AppContextMenuContent
          onPointerDown={(e) => {
            e.stopPropagation();
            handleMenuInteraction();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {renderMenuItems()}
        </AppContextMenuContent>
      </ContextMenu>
    );
  }

  return cardContent;
}
