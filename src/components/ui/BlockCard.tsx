"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
      if (editValue) inputRef.current.select();
    }
  }, [isEditing, editValue]);

  // Sync text prop to edit value
  useEffect(() => {
    if (!isEditing) setEditValue(text);
  }, [text, isEditing]);

  const lineClamp = height < 56 ? 1 : 2;
  const fontSize = compact ? "text-xs" : "text-sm";
  const padding = compact ? "px-2 py-1" : "px-2.5 py-1.5";

  const bgColor = completed
    ? "var(--completed-bg)"
    : roleColor
      ? getRoleColorStyleWithOpacity(roleColor, isHovered ? 0.12 : 0.08)
      : "var(--muted)";

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

  return (
    <div
      className={cn(
        "group flex items-center gap-1.5 rounded-md shadow-sm hover:shadow-md transition-shadow",
        fontSize,
        padding,
        className
      )}
      style={{
        height: `${height}px`,
        backgroundColor: bgColor,
        borderLeft: roleColor ? `3px solid ${getRoleColorStyle(roleColor)}` : undefined,
        opacity: completed ? "var(--completed-opacity)" : undefined,
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Checkbox */}
      {onToggle && (
        <div
          className="flex-shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={completed}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
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
          className="flex-1 min-w-0 h-auto py-0.5 text-inherit"
          placeholder={autoEdit ? "Block title..." : "Edit text..."}
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

      {/* Delete button */}
      {onDelete && !isEditing && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X className="size-3" />
        </Button>
      )}
    </div>
  );
}
