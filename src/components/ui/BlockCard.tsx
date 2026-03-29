"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Circle, CheckCircle, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
  variant?: "default" | "card";
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
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
  variant = "default",
  subtitle,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // Sync text prop to edit value
  useEffect(() => {
    if (!isEditing) setEditValue(text);
  }, [text, isEditing]);

  const lineClamp = height !== undefined && height < 56 ? 1 : 2;
  const fontSize = compact ? "text-[11px]" : "text-[13px]";
  const padding = compact ? "px-2 py-1" : "px-2.5 py-2.5";

  const isCard = variant === "card";

  const bgColor = isCard
    ? "var(--card)"
    : roleColor
      ? getRoleColorStyleWithOpacity(roleColor, isHovered ? 0.16 : 0.12)
      : completed
        ? "var(--completed-bg)"
        : "var(--muted)";

  const showBorder = roleColor && (isCard || !completed);
  const borderStyle = freestyle ? "dashed" : "solid";

  const showToggle = onToggle && !isEditing;
  const hasMenu = (onToggle || onDelete) && !isEditing;

  function handleDoubleClick() {
    if (editable && onEdit) {
      setIsEditing(true);
      setEditValue(text);
    }
  }

  function handleSave() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== text) {
      onEdit?.(trimmed);
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
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

  const menuItems = (
    <>
      {onToggle && (
        <ContextMenuItem onClick={onToggle}>
          <CheckCircle className="size-3.5 mr-2" />
          {completed ? "Mark incomplete" : "Mark complete"}
        </ContextMenuItem>
      )}
      {onDelete && (
        <ContextMenuItem className="text-destructive" onClick={onDelete}>
          <Trash2 className="size-3.5 mr-2" />
          Delete
        </ContextMenuItem>
      )}
    </>
  );

  const cardContent = (
    <div
      className={cn(
        "group relative flex items-start gap-1.5 transition-shadow",
        isCard ? "rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)]" : "rounded-[6px]",
        !completed && !isCard && "shadow-sm hover:shadow-md",
        fontSize,
        padding,
        className
      )}
      style={{
        ...(height !== undefined && { height: `${height}px` }),
        backgroundColor: bgColor,
        borderLeft: showBorder ? `3px ${borderStyle} ${getRoleColorStyle(roleColor!)}` : undefined,
        opacity: completed ? "var(--completed-opacity)" : undefined,
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Text or editing input */}
      {isEditing ? (
        <Input
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
        <div className={cn("flex-1 min-w-0", showToggle && "pr-5")}>
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
          {subtitle && (height === undefined || height >= 56) && (
            <span className="text-label text-muted-foreground truncate block mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Completion toggle — top-right */}
      {showToggle && (
        <div
          className="absolute top-2 right-1.5"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {completed ? (
            <Check className="size-3.5 text-primary" strokeWidth={3} />
          ) : (
            <Circle className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      )}
    </div>
  );

  // Wrap with ContextMenu if there are menu actions
  if (hasMenu) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {cardContent}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {menuItems}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return cardContent;
}
