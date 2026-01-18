/**
 * First Things First - UI Store
 *
 * Zustand store for transient UI state (not persisted to IndexedDB).
 * Handles drag-drop state, selection, and other ephemeral UI concerns.
 */

import { create } from "zustand";

// ============================================================================
// Types
// ============================================================================

/**
 * Drag source information for drag-drop operations.
 */
export interface DragSource {
  type: "goal" | "time-block" | "day-priority" | "evening-block";
  id: string;
  /** Source role ID for goal drags (used for color) */
  roleId?: string;
  /** Source day index for block moves */
  dayIndex?: number;
}

/**
 * Drop target information.
 */
export interface DropTarget {
  type: "calendar-slot" | "day-priorities" | "evening-slot" | "role-column";
  dayIndex: number;
  /** Slot index for calendar drops */
  slotIndex?: number;
}

/**
 * Modal state for the app.
 */
export type ModalType = "new-role" | "edit-role" | "new-goal" | "edit-goal" | "new-week" | null;

interface UIStore {
  // -------------------------------------------------------------------------
  // Drag State
  // -------------------------------------------------------------------------

  /** Whether a drag operation is in progress */
  isDragging: boolean;

  /** Information about what is being dragged */
  dragSource: DragSource | null;

  /** Current drop target (for highlighting) */
  dropTarget: DropTarget | null;

  /** Set drag state on drag start */
  setDragStart: (source: DragSource) => void;

  /** Update drop target during drag */
  setDropTarget: (target: DropTarget | null) => void;

  /** Clear drag state on drag end */
  setDragEnd: () => void;

  // -------------------------------------------------------------------------
  // Selection State
  // -------------------------------------------------------------------------

  /** Currently selected time block ID (for editing) */
  selectedBlockId: string | null;

  /** Set selected block */
  setSelectedBlock: (id: string | null) => void;

  /** Clear selection */
  clearSelection: () => void;

  // -------------------------------------------------------------------------
  // Modal State
  // -------------------------------------------------------------------------

  /** Currently open modal */
  activeModal: ModalType;

  /** Context data for the modal (e.g., role ID for edit-role) */
  modalContext: Record<string, unknown>;

  /** Open a modal with optional context */
  openModal: (modal: ModalType, context?: Record<string, unknown>) => void;

  /** Close the current modal */
  closeModal: () => void;

  // -------------------------------------------------------------------------
  // Sidebar State
  // -------------------------------------------------------------------------

  /** Whether the sidebar is collapsed */
  isSidebarCollapsed: boolean;

  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void;

  /** Set sidebar collapsed state */
  setSidebarCollapsed: (collapsed: boolean) => void;

  // -------------------------------------------------------------------------
  // Week Navigation
  // -------------------------------------------------------------------------

  /** Whether week navigation is in progress */
  isNavigating: boolean;

  /** Set navigation loading state */
  setNavigating: (navigating: boolean) => void;
}

// ============================================================================
// UI Store Implementation
// ============================================================================

export const useUIStore = create<UIStore>((set) => ({
  // -------------------------------------------------------------------------
  // Drag State
  // -------------------------------------------------------------------------

  isDragging: false,
  dragSource: null,
  dropTarget: null,

  setDragStart: (source: DragSource) => {
    set({
      isDragging: true,
      dragSource: source,
      dropTarget: null,
    });
  },

  setDropTarget: (target: DropTarget | null) => {
    set({ dropTarget: target });
  },

  setDragEnd: () => {
    set({
      isDragging: false,
      dragSource: null,
      dropTarget: null,
    });
  },

  // -------------------------------------------------------------------------
  // Selection State
  // -------------------------------------------------------------------------

  selectedBlockId: null,

  setSelectedBlock: (id: string | null) => {
    set({ selectedBlockId: id });
  },

  clearSelection: () => {
    set({ selectedBlockId: null });
  },

  // -------------------------------------------------------------------------
  // Modal State
  // -------------------------------------------------------------------------

  activeModal: null,
  modalContext: {},

  openModal: (modal: ModalType, context: Record<string, unknown> = {}) => {
    set({
      activeModal: modal,
      modalContext: context,
    });
  },

  closeModal: () => {
    set({
      activeModal: null,
      modalContext: {},
    });
  },

  // -------------------------------------------------------------------------
  // Sidebar State
  // -------------------------------------------------------------------------

  isSidebarCollapsed: false,

  toggleSidebar: () => {
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ isSidebarCollapsed: collapsed });
  },

  // -------------------------------------------------------------------------
  // Week Navigation
  // -------------------------------------------------------------------------

  isNavigating: false,

  setNavigating: (navigating: boolean) => {
    set({ isNavigating: navigating });
  },
}));

// ============================================================================
// Selector Hooks
// ============================================================================

/**
 * Check if a specific block is selected.
 */
export const selectIsBlockSelected = (state: UIStore, blockId: string): boolean => {
  return state.selectedBlockId === blockId;
};

/**
 * Check if dragging a specific type.
 */
export const selectIsDraggingType = (
  state: UIStore,
  type: DragSource["type"]
): boolean => {
  return state.isDragging && state.dragSource?.type === type;
};

/**
 * Check if a drop target is active.
 */
export const selectIsDropTargetActive = (
  state: UIStore,
  dayIndex: number,
  slotIndex?: number
): boolean => {
  if (!state.dropTarget) return false;
  if (state.dropTarget.dayIndex !== dayIndex) return false;
  if (slotIndex !== undefined && state.dropTarget.slotIndex !== slotIndex) {
    return false;
  }
  return true;
};
