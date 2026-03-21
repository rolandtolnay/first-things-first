import type { RoleColor } from "@/types";
import { getRoleColorStyle } from "@/lib/role-colors";
import { cn } from "@/lib/utils";

interface DragPreviewProps {
  text: string;
  roleColor?: RoleColor;
  variant?: "default" | "compact" | "evening";
}

const variantStyles = {
  default: {
    container: "flex items-center gap-2 py-1.5 px-3 rounded-md bg-card border border-border shadow-lg pointer-events-none min-w-[120px] max-w-[240px]",
    text: "text-sm text-foreground truncate",
  },
  compact: {
    container: "flex items-center gap-1.5 py-1 px-2 rounded bg-card border border-border shadow-lg pointer-events-none min-w-[100px] max-w-[200px]",
    text: "text-xs text-foreground truncate",
  },
  evening: {
    container: "flex items-center gap-2 py-2 px-3 rounded-sm shadow-lg pointer-events-none min-w-[100px] max-w-[200px]",
    text: "text-xs font-medium text-foreground truncate",
  },
};

export function DragPreview({ text, roleColor, variant = "default" }: DragPreviewProps) {
  const styles = variantStyles[variant];
  const colorStyle = roleColor ? getRoleColorStyle(roleColor) : undefined;

  if (variant === "evening") {
    return (
      <div
        className={cn(styles.container, !colorStyle && "bg-muted border border-border")}
        style={
          colorStyle
            ? {
                backgroundColor: `${colorStyle.replace(")", " / 0.2)")}`,
                borderLeft: `3px solid ${colorStyle}`,
              }
            : undefined
        }
      >
        <span className={styles.text}>{text}</span>
      </div>
    );
  }

  return (
    <div
      className={styles.container}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: colorStyle ?? "var(--border)",
      }}
    >
      <span className={styles.text}>{text}</span>
    </div>
  );
}
