"use client";

import { useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CheckCircle, Circle, MoreVertical, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWeekStore } from "@/stores/weekStore";
import { cn } from "@/lib/utils";
import { getRoleColorStyle, getRoleColorStyleWithOpacity } from "@/lib/role-colors";
import type { DayPriority, DayOfWeek, Goal, RoleColor } from "@/types";
import type { PriorityDragData } from "@/types/dnd";

interface PriorityItemProps {
  priority: DayPriority;
  goal: Goal;
  roleColor: RoleColor;
  dayIndex: DayOfWeek;
  height: number;
}

export function PriorityItem({ priority, goal, roleColor, dayIndex, height }: PriorityItemProps) {
  const removeDayPriority = useWeekStore((state) => state.removeDayPriority);
  const toggleDayPriorityCompleted = useWeekStore((state) => state.toggleDayPriorityCompleted);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dragData = {
    type: "priority",
    priorityId: priority.id,
    goalId: goal.id,
    roleId: goal.roleId,
    text: goal.text,
    sourceDayIndex: dayIndex,
  } satisfies PriorityDragData;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `priority-${priority.id}`,
    data: dragData,
  });

  function handleToggleCompleted() {
    toggleDayPriorityCompleted(priority.id);
  }

  function handleDelete() {
    removeDayPriority(priority.id);
  }

  function handleDropdownCloseAutoFocus(event: Event) {
    event.preventDefault();
    menuButtonRef.current?.blur();
  }

  const contextMenuItems = (
    <>
      <ContextMenuItem onSelect={handleToggleCompleted}>
        {priority.completed ? <Circle className="size-3.5 mr-2" /> : <CheckCircle className="size-3.5 mr-2" />}
        {priority.completed ? "Mark incomplete" : "Mark complete"}
      </ContextMenuItem>
      <ContextMenuItem className="text-destructive" onSelect={handleDelete}>
        <Trash2 className="size-3.5 mr-2" />
        Delete
      </ContextMenuItem>
    </>
  );

  const cardContent = (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
      style={{ height: `${height}px` }}
    >
      <div
        className="group relative flex h-full items-start gap-[12px] rounded-[var(--ds-r-sm)] px-1.5 py-1 text-[12px] font-semibold transition-[background-color,border-color]"
        style={{
          border: `1px solid color-mix(in oklab, ${getRoleColorStyle(roleColor)}, transparent 65%)`,
          backgroundColor: getRoleColorStyleWithOpacity(roleColor, 0.12),
        }}
      >
        <button
          type="button"
          className={cn(
            "mt-[5px] size-2 shrink-0 rounded-full transition-[box-shadow,opacity]",
            priority.completed && "opacity-80"
          )}
          style={{ backgroundColor: getRoleColorStyle(roleColor) }}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            handleToggleCompleted();
          }}
          aria-label={priority.completed ? "Mark priority incomplete" : "Mark priority complete"}
        />
        <span
          className="min-w-0 flex-1 overflow-hidden pr-4 leading-[18px] text-foreground"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            textDecoration: priority.completed ? "line-through" : undefined,
            textDecorationColor: priority.completed ? "var(--muted-foreground)" : undefined,
          }}
        >
          {goal.text}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              ref={menuButtonRef}
              type="button"
              className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-[4px] text-muted-foreground opacity-0 transition-[background-color,color,opacity] hover:bg-[var(--ds-line)] hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onDoubleClick={(event) => event.stopPropagation()}
              aria-label="Open priority menu"
            >
              <MoreVertical className="size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-auto min-w-36"
            onCloseAutoFocus={handleDropdownCloseAutoFocus}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <DropdownMenuItem onSelect={handleToggleCompleted}>
              {priority.completed ? <Circle className="size-3.5 mr-2" /> : <CheckCircle className="size-3.5 mr-2" />}
              {priority.completed ? "Mark incomplete" : "Mark complete"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onSelect={handleDelete}>
              <Trash2 className="size-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {cardContent}
      </ContextMenuTrigger>
      <ContextMenuContent
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        {contextMenuItems}
      </ContextMenuContent>
    </ContextMenu>
  );
}
