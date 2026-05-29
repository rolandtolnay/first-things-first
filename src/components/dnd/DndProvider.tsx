"use client";

/**
 * DndProvider - Drag-Drop Context Provider
 *
 * Wraps the application with dnd-kit's DndContext, configuring:
 * - Pointer and keyboard sensors with activation constraints
 * - Collision detection (rectIntersection) - detects when dragged element overlaps drop zone
 * - DragOverlay for smooth drag previews
 *
 * Handles cross-section drag-drop for all item types:
 * - Goals (sidebar): creates copies in priorities/timegrid/evening
 * - Blocks (timegrid): moves to priorities/evening/other timegrid slots
 * - Priorities: moves to timegrid/evening/other day's priorities
 * - Evening blocks: moves to priorities/timegrid/other day's evening
 *
 * Drop animation plays for moving items (blocks/priorities/evening),
 * but not for goals which create copies.
 *
 * Individual components use useDraggable and useDroppable hooks.
 */

import { useState, useCallback, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import type { DragData, DropZoneData } from "@/types/dnd";
import { useWeekStore } from "@/stores/weekStore";
import { MAX_PRIORITIES_PER_DAY } from "@/lib/constants";
import { DragOverlayContent } from "./DragOverlayContent";

interface DndProviderProps {
  children: React.ReactNode;
}

export function DndProvider({ children }: DndProviderProps) {
  // Track currently dragged item data for DragOverlay
  const [activeData, setActiveData] = useState<DragData | null>(null);
  const [activeRect, setActiveRect] = useState<{ width: number; height: number } | null>(null);
  // Ref preserves drag type across the re-render caused by setActiveData(null)
  // so dropAnimation stays correct when dnd-kit reads it
  const activeTypeRef = useRef<DragData["type"] | null>(null);

  // Get store actions for drop handling.
  // goal→priorities and goal→evening are single-array, non-placement creates and
  // stay inline; every placement / cross-zone move routes through a scheduling action.
  const addDayPriority = useWeekStore((state) => state.addDayPriority);
  const addEveningBlock = useWeekStore((state) => state.addEveningBlock);
  const placeTimeBlockAt = useWeekStore((state) => state.placeTimeBlockAt);
  const moveTimeBlock = useWeekStore((state) => state.moveTimeBlock);
  const moveBlockToEvening = useWeekStore((state) => state.moveBlockToEvening);
  const convertBlockToPriority = useWeekStore((state) => state.convertBlockToPriority);
  const convertPriorityToBlock = useWeekStore((state) => state.convertPriorityToBlock);
  const convertPriorityToEvening = useWeekStore((state) => state.convertPriorityToEvening);
  const movePriorityToDay = useWeekStore((state) => state.movePriorityToDay);
  const moveEveningToBlock = useWeekStore((state) => state.moveEveningToBlock);
  const convertEveningToPriority = useWeekStore((state) => state.convertEveningToPriority);
  const moveEveningToDay = useWeekStore((state) => state.moveEveningToDay);

  // Configure sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before drag starts (prevents accidental drags)
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Handle drag start - capture active item data and source dimensions
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragData;
    activeTypeRef.current = data.type;
    setActiveData(data);

    // Find the draggable source element from the pointer event target
    const target = event.activatorEvent.target as HTMLElement | null;
    if (target) {
      // Walk up to the element with dnd-kit's draggable attributes (role="button")
      const draggable = target.closest<HTMLElement>('[role="button"]');
      if (draggable) {
        const rect = draggable.getBoundingClientRect();
        setActiveRect({ width: rect.width, height: rect.height });
      }
    }
  }, []);

  // Handle drag end — flat dispatch on (dragData.type, dropData.zone).
  //
  // Each branch builds intent and calls one store action; the placement
  // decisions (overlap, clamping) and the atomic cross-zone moves live in the
  // scheduling layer + store. What stays here is DnD policy: the over==null
  // guard, the isPrioritiesFull capacity gate, and the goal single-array creates.
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // Clear active state
      setActiveData(null);
      setActiveRect(null);

      // No valid drop target
      if (!over) return;

      const dragData = active.data.current as DragData;
      const dropData = over.data.current as DropZoneData;
      const day = dropData.dayIndex;
      const slot = dropData.slotIndex;

      // Capacity policy: priorities section is full for this day.
      const isPrioritiesFull = (dayIdx: number) => {
        const currentWeek = useWeekStore.getState().currentWeek;
        const count = currentWeek?.dayPriorities?.filter((p) => p.dayIndex === dayIdx).length ?? 0;
        return count >= MAX_PRIORITIES_PER_DAY;
      };

      switch (dragData.type) {
        case "block": {
          const { blockId } = dragData;
          if (dropData.zone === "priorities") {
            if (isPrioritiesFull(day)) return;
            convertBlockToPriority(blockId, day);
          } else if (dropData.zone === "evening") {
            moveBlockToEvening(blockId, day);
          } else if (dropData.zone === "timegrid" && slot !== undefined) {
            moveTimeBlock(blockId, day, slot);
          }
          return;
        }

        case "priority": {
          const { priorityId } = dragData;
          if (dropData.zone === "timegrid" && slot !== undefined) {
            convertPriorityToBlock(priorityId, day, slot);
          } else if (dropData.zone === "evening") {
            convertPriorityToEvening(priorityId, day);
          } else if (dropData.zone === "priorities") {
            if (isPrioritiesFull(day)) return;
            movePriorityToDay(priorityId, day);
          }
          return;
        }

        case "evening": {
          const { eveningBlockId } = dragData;
          if (dropData.zone === "priorities") {
            if (isPrioritiesFull(day)) return;
            convertEveningToPriority(eveningBlockId, day);
          } else if (dropData.zone === "timegrid" && slot !== undefined) {
            moveEveningToBlock(eveningBlockId, day, slot);
          } else if (dropData.zone === "evening") {
            moveEveningToDay(eveningBlockId, day);
          }
          return;
        }

        case "goal": {
          if (dropData.zone === "priorities") {
            if (isPrioritiesFull(day)) return;
            addDayPriority({ goalId: dragData.goalId, dayIndex: day, completed: false });
          } else if (dropData.zone === "timegrid" && slot !== undefined) {
            placeTimeBlockAt(
              {
                type: "goal",
                goalId: dragData.goalId,
                roleId: dragData.roleId,
                dayIndex: day,
                title: dragData.text,
                completed: false,
              },
              slot
            );
          } else if (dropData.zone === "evening") {
            // Single-array create — addEveningBlock guards the one-per-day rule,
            // but pre-check so the throw never fires (silent snap-back).
            const existing = useWeekStore
              .getState()
              .currentWeek?.eveningBlocks.find((b) => b.dayIndex === day);
            if (existing) return;
            addEveningBlock({
              type: "goal",
              goalId: dragData.goalId,
              roleId: dragData.roleId,
              dayIndex: day,
              title: dragData.text,
              completed: false,
            });
          }
          return;
        }
      }
    },
    [
      addDayPriority,
      addEveningBlock,
      placeTimeBlockAt,
      moveTimeBlock,
      moveBlockToEvening,
      convertBlockToPriority,
      convertPriorityToBlock,
      convertPriorityToEvening,
      movePriorityToDay,
      moveEveningToBlock,
      convertEveningToPriority,
      moveEveningToDay,
    ]
  );

  // Handle drag cancel - clear active state
  const handleDragCancel = useCallback(() => {
    setActiveData(null);
    setActiveRect(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      {/*
        CRITICAL: Always keep DragOverlay mounted, only conditionally render children.
        Drop animation: Goals create copies (no swoosh-back needed).
        Everything else (blocks, priorities, evening) moves, so animate.
      */}
      <DragOverlay
        dropAnimation={
          activeTypeRef.current === "goal"
            ? null // Goals create copies, no animation needed
            : { duration: 200, easing: "ease" } // Everything else moves
        }
      >
        {activeData ? <DragOverlayContent data={activeData} sourceRect={activeRect} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default DndProvider;
