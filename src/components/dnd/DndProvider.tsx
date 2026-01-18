"use client";

/**
 * DndProvider - Drag-Drop Context Provider
 *
 * Wraps the application with dnd-kit's DndContext, configuring:
 * - Pointer and keyboard sensors with activation constraints
 * - Collision detection (closestCenter)
 * - DragOverlay for smooth drag previews
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
import type { DragData } from "@/types/dnd";
import { DragOverlayContent } from "./DragOverlayContent";

interface DndProviderProps {
  children: React.ReactNode;
}

export function DndProvider({ children }: DndProviderProps) {
  // Track currently dragged item data for DragOverlay
  const [activeData, setActiveData] = useState<DragData | null>(null);

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
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    // Clear active state first (will be processed by drop handlers in later plans)
    setActiveData(null);

    // TODO: Implement drop handling in Plan 05-02 and 05-03
    // The drop logic will be handled by the DndProvider or individual drop zones
    // For now, this is a stub that logs drop events for debugging
    if (over) {
      console.log("[DndProvider] Drop event:", {
        activeId: active.id,
        overId: over.id,
        activeData: active.data.current,
        overData: over.data.current,
      });
    }
  }, []);

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
