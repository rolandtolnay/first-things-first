"use client";

/**
 * DndProvider - Drag-Drop Context Provider
 *
 * Wraps the application with dnd-kit's DndContext, configuring:
 * - Pointer and keyboard sensors with activation constraints
 * - Collision detection (closestCenter)
 * - DragOverlay for smooth drag previews
 *
 * Handles drop events for:
 * - timegrid zone: creates TimeBlock (1 hour = 2 slots)
 * - evening zone: creates EveningBlock
 *
 * This provider enables drag-drop functionality across the app.
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
  closestCenter,
} from "@dnd-kit/core";
import type { DayOfWeek, TimeSlotIndex } from "@/types";
import type { DragData, DropZoneData, GoalDragData } from "@/types/dnd";
import { useWeekStore } from "@/stores/weekStore";
import { DragOverlayContent } from "./DragOverlayContent";

interface DndProviderProps {
  children: React.ReactNode;
}

export function DndProvider({ children }: DndProviderProps) {
  // Track currently dragged item data for DragOverlay
  const [activeData, setActiveData] = useState<DragData | null>(null);

  // Get store actions for drop handling
  const addTimeBlock = useWeekStore((state) => state.addTimeBlock);
  const addEveningBlock = useWeekStore((state) => state.addEveningBlock);

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

      // Only handle goal drops for now
      if (dragData.type !== "goal") return;

      const goalData = dragData as GoalDragData;

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
    [addTimeBlock, addEveningBlock]
  );

  // Handle drag cancel - clear active state
  const handleDragCancel = useCallback(() => {
    setActiveData(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      {/*
        CRITICAL: Always keep DragOverlay mounted, only conditionally render children.
        This ensures drop animations work correctly.
      */}
      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeData ? <DragOverlayContent data={activeData} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default DndProvider;
