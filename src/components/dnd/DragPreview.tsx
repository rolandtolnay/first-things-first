import { BlockCard } from "@/components/ui/BlockCard";
import type { RoleColor } from "@/types";

interface DragPreviewProps {
  text: string;
  roleColor?: RoleColor;
  width?: number;
  height?: number;
  roleBorder?: "accent" | "uniform";
}

export function DragPreview({ text, roleColor, width, height, roleBorder }: DragPreviewProps) {
  return (
    <div
      className="pointer-events-none"
      style={{
        width: width ? `${width}px` : "200px",
        height: height ? `${height}px` : undefined,
        boxShadow: "var(--shadow-drag)",
      }}
    >
      <BlockCard
        text={text}
        roleColor={roleColor}
        roleBorder={roleBorder}
        compact
        height={height ?? 56}
      />
    </div>
  );
}
