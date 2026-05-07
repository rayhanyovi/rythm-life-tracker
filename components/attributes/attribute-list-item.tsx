"use client";

import { type DragEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  PencilLine,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCategoryColor } from "@/lib/category-colors";
import { cn } from "@/lib/utils";
import { type DragState } from "@/hooks/use-reorder-list";

export type AttributeRecord = {
  id: string;
  name: string;
  sortOrder: number;
};

export function AttributeListItem({
  attribute,
  dragState,
  editingName,
  index,
  isEditing,
  isPending,
  selected,
  totalCount,
  onCancelEdit,
  onDelete,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onEditNameChange,
  onEditStart,
  onMoveDown,
  onMoveUp,
  onPointerDown,
  onRename,
  onSelect,
}: {
  attribute: AttributeRecord;
  dragState: DragState | null;
  editingName: string;
  index: number;
  isEditing: boolean;
  isPending: boolean;
  selected: boolean;
  totalCount: number;
  onCancelEdit: () => void;
  onDelete: () => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragStart: (event: DragEvent<HTMLButtonElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onEditNameChange: (value: string) => void;
  onEditStart: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onRename: () => void;
  onSelect: () => void;
}) {
  const isDragged = dragState?.id === attribute.id;
  const isDragTarget = dragState?.overId === attribute.id;

  return (
    <section
      data-reorder-id={attribute.id}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "border-b border-border transition-colors duration-[160ms] ease-out",
        selected ? "bg-accent" : "bg-card hover:bg-muted/35",
        isDragged && "opacity-60",
        isDragTarget && dragState?.id !== attribute.id && "bg-muted",
      )}
    >
      <div className="grid gap-3 px-5 py-2.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        {/* Drag + move controls */}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            draggable={!isPending}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onPointerDown={onPointerDown}
            disabled={isPending}
            className="size-8 cursor-grab text-muted-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
            <span className="sr-only">Reorder {attribute.name}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onMoveUp}
            disabled={isPending || index === 0}
            className="size-8"
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onMoveDown}
            disabled={isPending || index === totalCount - 1}
            className="size-8"
          >
            <ArrowDown className="size-4" />
          </Button>
        </div>

        {/* Name / edit field */}
        {isEditing ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={editingName}
              onChange={(event) => onEditNameChange(event.target.value)}
              disabled={isPending}
              className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
              onKeyDown={(event) => {
                if (event.key === "Enter") onRename();
                if (event.key === "Escape") onCancelEdit();
              }}
              autoFocus
            />
            <div className="flex gap-1.5">
              <Button size="sm" onClick={onRename} disabled={isPending}>
                <Check className="size-4" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelEdit} disabled={isPending}>
                <X className="size-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={onSelect} className="min-w-0 text-left">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: getCategoryColor(attribute.name) }}
              />
              <p className="truncate text-[13px] font-medium leading-5 text-foreground">
                {attribute.name}
              </p>
            </div>
            <p className="mt-1 font-mono text-[10px] leading-5 text-muted-foreground">
              Order {index + 1} in the Tasks workspace
            </p>
          </button>
        )}

        {/* Action buttons */}
        {!isEditing ? (
          <div className="flex items-center gap-1.5 sm:justify-self-end">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2 text-xs"
              onClick={onEditStart}
              disabled={isPending}
            >
              <PencilLine className="size-4" />
              Rename
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
              disabled={isPending}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
