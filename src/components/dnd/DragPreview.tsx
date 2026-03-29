import { BlockCard } from "@/components/ui/BlockCard";
import type { RoleColor } from "@/types";

interface DragPreviewProps {
  text: string;
  roleColor?: RoleColor;
}

export function DragPreview({ text, roleColor }: DragPreviewProps) {
  return (
    <div className="pointer-events-none w-[200px]" style={{ boxShadow: 'var(--shadow-drag)' }}>
      <BlockCard
        text={text}
        roleColor={roleColor}
        compact
        height={56}
      />
    </div>
  );
}
