import type { RoleColor } from "@/types";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";

interface DragPreviewProps {
  text: string;
  roleColor?: RoleColor;
  variant?: "default" | "compact" | "evening";
}

export function DragPreview({ text, roleColor, variant = "default" }: DragPreviewProps) {
  const isCompact = variant === "compact" || variant === "evening";
  const fontSize = isCompact ? '12px' : '14px';
  const fontWeight = variant === "evening" ? 500 : undefined;
  const padding = isCompact ? '6px 10px' : '8px 14px';
  const minWidth = isCompact ? '100px' : '120px';
  const maxWidth = isCompact ? '200px' : '240px';

  return (
    <div
      className="flex items-center gap-2 pointer-events-none"
      style={{
        backgroundColor: roleColor
          ? getRoleColorStyleWithOpacity(roleColor, 0.08)
          : 'var(--bg-card)',
        borderLeft: `3px solid ${roleColor ? getRoleColorStyle(roleColor) : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-drag)',
        padding,
        minWidth,
        maxWidth,
      }}
    >
      <span
        className="truncate"
        style={{
          fontSize,
          fontWeight,
          color: 'var(--text-primary)',
        }}
      >
        {text}
      </span>
    </div>
  );
}
