"use client";

import { useState, useRef, useEffect } from "react";
import { Check, MoreVertical, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  height = 56,
  autoEdit,
  className,
  style,
  onToggle,
  onDelete,
  onEdit,
}: BlockCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const lineClamp = height < 56 ? 1 : 2;
  const fontSize = compact ? "text-xs" : "text-sm";
  const padding = compact ? "px-2.5 py-2" : "px-3 py-2";

  const bgColor = roleColor
    ? getRoleColorStyleWithOpacity(roleColor, isHovered ? 0.12 : 0.08)
    : completed
      ? "var(--completed-bg)"
      : "var(--muted)";

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
        "group relative flex items-start gap-1.5 rounded-md transition-shadow",
        !completed && "shadow-sm hover:shadow-md",
        fontSize,
        padding,
        className
      )}
      style={{
        height: `${height}px`,
        backgroundColor: bgColor,
        border: roleColor && !completed ? `0.5px solid ${getRoleColorStyle(roleColor)}` : undefined,
        opacity: completed ? "var(--completed-opacity)" : undefined,
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Completed check icon */}
      {completed && onToggle && (
        <Check className="size-3.5 flex-shrink-0 text-primary mt-0.5" strokeWidth={3} />
      )}

      {/* Text or editing input */}
      {isEditing ? (
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 font-medium"
          style={{ fontSize: "inherit", lineHeight: "1.4" }}
          placeholder={autoEdit ? "Block title..." : ""}
        />
      ) : (
        <span
          className="flex-1 min-w-0 font-medium overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: lineClamp,
            WebkitBoxOrient: "vertical",
            lineHeight: "1.4",
          }}
        >
          {text}
        </span>
      )}

      {/* Absolute-positioned menu button (overlay, doesn't steal text space) */}
      {hasMenu && (
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className={cn(
                "absolute top-1 right-1 rounded-sm border-0 bg-transparent text-foreground/60 hover:bg-foreground/10 hover:text-foreground/80 transition-opacity",
                menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MoreVertical className="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto min-w-[160px] p-1"
            align="end"
            side="bottom"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {onToggle && (
              <button
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-foreground"
                onClick={() => { onToggle(); setMenuOpen(false); }}
              >
                <CheckCircle className="size-3.5" />
                {completed ? "Mark incomplete" : "Mark complete"}
              </button>
            )}
            {onDelete && (
              <button
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-destructive"
                onClick={() => { onDelete(); setMenuOpen(false); }}
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            )}
          </PopoverContent>
        </Popover>
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
