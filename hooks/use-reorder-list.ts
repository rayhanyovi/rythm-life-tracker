"use client";

import { type PointerEvent, type DragEvent, useRef, useState } from "react";

export type DragState = {
  id: string;
  mode: "native" | "pointer";
  overId: string | null;
};

export type ReorderListResult = {
  dragState: DragState | null;
  handleNativeDragStart: (event: DragEvent<HTMLButtonElement>, id: string) => void;
  handleNativeDrop: (event: DragEvent<HTMLElement>, targetId: string) => void;
  handlePointerDragStart: (event: PointerEvent<HTMLButtonElement>, id: string) => void;
  handleNativeDragEnd: () => void;
  handleNativeDragOver: (event: DragEvent<HTMLElement>, id: string) => void;
  reorderByTarget: (sourceId: string, targetId: string | null) => void;
};

/**
 * Encapsulates native-drag and pointer-drag reorder logic for a sortable list.
 *
 * @param items       The current ordered list.
 * @param onReorder   Called with the reordered array whenever a drag completes.
 * @param isPending   When true, pointer drag is blocked.
 */
export function useReorderList<T extends { id: string }>(
  items: T[],
  onReorder: (reordered: T[]) => void,
  isPending: boolean,
): ReorderListResult {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragOverIdRef = useRef<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const pointerDraggingRef = useRef(false);

  const clearLongPressTimer = () => {
    if (!longPressTimerRef.current) return;
    window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const reorderByTarget = (sourceId: string, targetId: string | null) => {
    if (!targetId || sourceId === targetId) return;

    const sourceIndex = items.findIndex((item) => item.id === sourceId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0) return;

    const reordered = [...items];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onReorder(reordered);
  };

  const handleNativeDragStart = (
    event: DragEvent<HTMLButtonElement>,
    id: string,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    dragOverIdRef.current = id;
    setDragState({ id, mode: "native", overId: id });
  };

  const handleNativeDragEnd = () => {
    dragOverIdRef.current = null;
    setDragState(null);
  };

  const handleNativeDragOver = (event: DragEvent<HTMLElement>, id: string) => {
    if (!dragState) return;
    event.preventDefault();
    dragOverIdRef.current = id;
    setDragState((current) =>
      current ? { ...current, overId: id } : current,
    );
  };

  const handleNativeDrop = (event: DragEvent<HTMLElement>, targetId: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || dragState?.id;
    setDragState(null);
    dragOverIdRef.current = null;
    if (sourceId) reorderByTarget(sourceId, targetId);
  };

  const handlePointerDragStart = (
    event: PointerEvent<HTMLButtonElement>,
    id: string,
  ) => {
    if (event.pointerType === "mouse" || isPending) return;

    const pointerId = event.pointerId;
    pointerDraggingRef.current = false;
    dragOverIdRef.current = id;
    clearLongPressTimer();

    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      if (moveEvent.pointerId !== pointerId || !pointerDraggingRef.current) return;
      moveEvent.preventDefault();

      const target = document
        .elementFromPoint(moveEvent.clientX, moveEvent.clientY)
        ?.closest<HTMLElement>("[data-reorder-id]");
      const overId = target?.dataset.reorderId ?? id;
      dragOverIdRef.current = overId;
      setDragState({ id, mode: "pointer", overId });
    };

    const finishPointerDrag = (cancelled = false) => {
      clearLongPressTimer();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);

      const overId = dragOverIdRef.current;
      const wasDragging = pointerDraggingRef.current;
      pointerDraggingRef.current = false;
      dragOverIdRef.current = null;
      setDragState(null);

      if (!cancelled && wasDragging) {
        reorderByTarget(id, overId);
      }
    };

    const handlePointerUp = (upEvent: globalThis.PointerEvent) => {
      if (upEvent.pointerId === pointerId) finishPointerDrag(false);
    };

    const handlePointerCancel = (cancelEvent: globalThis.PointerEvent) => {
      if (cancelEvent.pointerId === pointerId) finishPointerDrag(true);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    longPressTimerRef.current = window.setTimeout(() => {
      pointerDraggingRef.current = true;
      setDragState({ id, mode: "pointer", overId: id });
    }, 280);
  };

  return {
    dragState,
    handleNativeDragStart,
    handleNativeDrop,
    handlePointerDragStart,
    handleNativeDragEnd,
    handleNativeDragOver,
    reorderByTarget,
  };
}
