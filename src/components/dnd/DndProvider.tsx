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

import { useState, useCallback } from "react";
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
import type { DayOfWeek, TimeSlotIndex } from "@/types";
import type { DragData, DropZoneData, GoalDragData, BlockDragData, PriorityDragData, EveningDragData } from "@/types/dnd";
import { useWeekStore } from "@/stores/weekStore";
import { DragOverlayContent } from "./DragOverlayContent";

interface DndProviderProps {
  children: React.ReactNode;
}

export function DndProvider({ children }: DndProviderProps) {
  // Track currently dragged item data for DragOverlay
  const [activeData, setActiveData] = useState<DragData | null>(null);

  // Get store actions for drop handling
  const addDayPriority = useWeekStore((state) => state.addDayPriority);
  const addTimeBlock = useWeekStore((state) => state.addTimeBlock);
  const addEveningBlock = useWeekStore((state) => state.addEveningBlock);
  const updateTimeBlock = useWeekStore((state) => state.updateTimeBlock);
  const deleteTimeBlock = useWeekStore((state) => state.deleteTimeBlock);
  const removeDayPriority = useWeekStore((state) => state.removeDayPriority);
  const deleteEveningBlock = useWeekStore((state) => state.deleteEveningBlock);

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

  // Handle drag start - capture active item data
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragData;
    setActiveData(data);
  }, []);

  // Handle drag end - process drop and clear active state
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // Clear active state
      setActiveData(null);

      // No valid drop target
      if (!over) return;

      const dragData = active.data.current as DragData;
      const dropData = over.data.current as DropZoneData;

      // Handle block drops
      if (dragData.type === "block") {
        const blockData = dragData as BlockDragData;
        const currentWeek = useWeekStore.getState().currentWeek;
        const block = currentWeek?.timeBlocks.find((b) => b.id === blockData.blockId);
        if (!block) return;

        // Block → Priorities: Create priority from block (if goal-based)
        if (dropData.zone === "priorities") {
          // Freestyle blocks (no goalId) can't become priorities - silently skip
          if (!block.goalId) return;
          addDayPriority({
            goalId: block.goalId,
            dayIndex: dropData.dayIndex as DayOfWeek,
            completed: false,
          });
          deleteTimeBlock(blockData.blockId);
          return;
        }

        // Block → Evening: Create evening block from time block
        if (dropData.zone === "evening") {
          // Check if evening slot is already occupied
          const existingEvening = currentWeek?.eveningBlocks.find(
            (b) => b.dayIndex === dropData.dayIndex
          );
          if (existingEvening) return; // Silently skip if occupied

          addEveningBlock({
            type: block.goalId ? "goal" : "freestyle",
            goalId: block.goalId,
            roleId: block.roleId,
            dayIndex: dropData.dayIndex as DayOfWeek,
            title: block.title,
            completed: false,
          });
          deleteTimeBlock(blockData.blockId);
          return;
        }

        // Block → Timegrid: Move block to new day/slot
        if (dropData.zone === "timegrid" && dropData.slotIndex !== undefined) {
          updateTimeBlock(blockData.blockId, {
            dayIndex: dropData.dayIndex as DayOfWeek,
            startSlot: dropData.slotIndex as TimeSlotIndex,
          });
          return;
        }
        return;
      }

      // Handle priority drops (move existing priority)
      if (dragData.type === "priority") {
        const priorityData = dragData as PriorityDragData;

        // Priority → Timegrid: Create time block and remove priority
        if (dropData.zone === "timegrid" && dropData.slotIndex !== undefined) {
          addTimeBlock({
            type: "goal",
            goalId: priorityData.goalId,
            roleId: priorityData.roleId,
            dayIndex: dropData.dayIndex as DayOfWeek,
            startSlot: dropData.slotIndex as TimeSlotIndex,
            duration: 2, // 1 hour = 2 x 30-min slots
            title: priorityData.text,
            completed: false,
          });
          removeDayPriority(priorityData.priorityId);
          return;
        }

        // Priority → Evening: Create evening block and remove priority
        if (dropData.zone === "evening") {
          // Check if evening slot is already occupied
          const currentWeek = useWeekStore.getState().currentWeek;
          const existingEvening = currentWeek?.eveningBlocks.find(
            (b) => b.dayIndex === dropData.dayIndex
          );
          if (existingEvening) return; // Silently skip if occupied

          addEveningBlock({
            type: "goal",
            goalId: priorityData.goalId,
            roleId: priorityData.roleId,
            dayIndex: dropData.dayIndex as DayOfWeek,
            title: priorityData.text,
            completed: false,
          });
          removeDayPriority(priorityData.priorityId);
          return;
        }

        // Priority → Priorities (different day): Move priority
        if (dropData.zone === "priorities") {
          // Skip if same day (no-op)
          if (priorityData.sourceDayIndex === dropData.dayIndex) return;

          addDayPriority({
            goalId: priorityData.goalId,
            dayIndex: dropData.dayIndex as DayOfWeek,
            completed: false,
          });
          removeDayPriority(priorityData.priorityId);
          return;
        }
        return;
      }

      // Handle evening block drops (move existing evening block)
      if (dragData.type === "evening") {
        const eveningData = dragData as EveningDragData;
        const currentWeek = useWeekStore.getState().currentWeek;
        const eveningBlock = currentWeek?.eveningBlocks.find(
          (b) => b.id === eveningData.eveningBlockId
        );
        if (!eveningBlock) return;

        // Evening → Priorities: Create priority (if goal-based)
        if (dropData.zone === "priorities") {
          // Freestyle evening blocks (no goalId) can't become priorities - silently skip
          if (!eveningData.goalId) return;
          addDayPriority({
            goalId: eveningData.goalId,
            dayIndex: dropData.dayIndex as DayOfWeek,
            completed: false,
          });
          deleteEveningBlock(eveningData.eveningBlockId);
          return;
        }

        // Evening → Timegrid: Create time block
        if (dropData.zone === "timegrid" && dropData.slotIndex !== undefined) {
          addTimeBlock({
            type: eveningData.goalId ? "goal" : "freestyle",
            goalId: eveningData.goalId,
            roleId: eveningData.roleId,
            dayIndex: dropData.dayIndex as DayOfWeek,
            startSlot: dropData.slotIndex as TimeSlotIndex,
            duration: 2, // 1 hour = 2 x 30-min slots
            title: eveningData.title,
            completed: false,
          });
          deleteEveningBlock(eveningData.eveningBlockId);
          return;
        }

        // Evening → Evening (different day): Move evening block
        if (dropData.zone === "evening") {
          // Skip if same day (no-op)
          if (eveningData.sourceDayIndex === dropData.dayIndex) return;

          // Check if target day already has evening block
          const existingEvening = currentWeek?.eveningBlocks.find(
            (b) => b.dayIndex === dropData.dayIndex
          );
          if (existingEvening) return; // Silently skip if occupied

          // Create new evening block on target day with same data
          addEveningBlock({
            type: eveningBlock.type,
            goalId: eveningBlock.goalId,
            roleId: eveningBlock.roleId,
            dayIndex: dropData.dayIndex as DayOfWeek,
            title: eveningBlock.title,
            completed: false, // Reset completed status on move
          });
          deleteEveningBlock(eveningData.eveningBlockId);
          return;
        }
        return;
      }

      // Handle goal drops
      if (dragData.type !== "goal") return;

      const goalData = dragData as GoalDragData;

      // Handle priorities drops (creates DayPriority entry)
      if (dropData.zone === "priorities") {
        addDayPriority({
          goalId: goalData.goalId,
          dayIndex: dropData.dayIndex as DayOfWeek,
          completed: false,
        });
        return;
      }

      // Handle timegrid drops (creates 1-hour TimeBlock)
      if (dropData.zone === "timegrid" && dropData.slotIndex !== undefined) {
        addTimeBlock({
          type: "goal",
          goalId: goalData.goalId,
          roleId: goalData.roleId,
          dayIndex: dropData.dayIndex as DayOfWeek,
          startSlot: dropData.slotIndex as TimeSlotIndex,
          duration: 2, // 1 hour = 2 x 30-min slots
          title: goalData.text,
          completed: false,
        });
        return;
      }

      // Handle evening drops (creates EveningBlock)
      if (dropData.zone === "evening") {
        // Check if evening slot is already occupied
        const currentWeek = useWeekStore.getState().currentWeek;
        const existingBlock = currentWeek?.eveningBlocks.find(
          (b) => b.dayIndex === dropData.dayIndex
        );
        if (existingBlock) {
          // Evening slot already has a block - silently skip
          return;
        }
        addEveningBlock({
          type: "goal",
          goalId: goalData.goalId,
          roleId: goalData.roleId,
          dayIndex: dropData.dayIndex as DayOfWeek,
          title: goalData.text,
          completed: false,
        });
        return;
      }
    },
    [addDayPriority, addTimeBlock, addEveningBlock, updateTimeBlock, deleteTimeBlock, removeDayPriority, deleteEveningBlock]
  );

  // Handle drag cancel - clear active state
  const handleDragCancel = useCallback(() => {
    setActiveData(null);
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
          activeData?.type === "goal"
            ? null // Goals create copies, no animation needed
            : { duration: 200, easing: "ease" } // Everything else moves
        }
      >
        {activeData ? <DragOverlayContent data={activeData} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default DndProvider;
