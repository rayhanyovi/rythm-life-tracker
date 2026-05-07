"use client";

import { CircleAlert, PencilLine, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DetailRow } from "@/components/ui/detail-row";
import { ItemBadge } from "@/components/ui/item-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getCategoryColor } from "@/lib/category-colors";
import {
  type TaskRecord,
  CADENCE_LABELS,
  TASK_KIND_LABELS,
  formatTimestamp,
} from "@/components/tasks/task-types";

function KindBadge({
  taskKind,
  cadence,
}: {
  taskKind: TaskRecord["taskKind"];
  cadence: TaskRecord["cadence"];
}) {
  let label: string;

  if (taskKind === "RECURRING" && cadence) {
    label = CADENCE_LABELS[cadence];
  } else {
    label = TASK_KIND_LABELS[taskKind];
  }

  return <ItemBadge label={label} />;
}

function TaskDetailContent({
  isPending,
  onDelete,
  onEdit,
  onToggleActive,
  task,
}: {
  isPending: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  task: TaskRecord;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Selected task
        </p>
        <h2 className="text-[15px] font-semibold leading-6 tracking-tight text-foreground">
          {task.title}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {task.description ?? "No description yet."}
        </p>
      </div>

      <div className="space-y-4 border-y border-border py-4">
        <DetailRow label="Attribute">
          <span className="inline-flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: getCategoryColor(task.attribute.name) }}
            />
            {task.attribute.name}
          </span>
        </DetailRow>
        <DetailRow label="Type">
          <KindBadge taskKind={task.taskKind} cadence={task.cadence} />
        </DetailRow>
        {task.taskKind === "TODO" && task.dueDate ? (
          <DetailRow label="Due date">
            {new Date(task.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </DetailRow>
        ) : null}
        <DetailRow label="Status">
          {task.isActive ? "Active" : "Inactive"}
        </DetailRow>
        <DetailRow label="Created">{formatTimestamp(task.createdAt)}</DetailRow>
        <DetailRow label="Last updated">{formatTimestamp(task.updatedAt)}</DetailRow>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onEdit} disabled={isPending}>
          <PencilLine className="size-4" />
          Edit task
        </Button>
        <Button size="sm" variant="outline" onClick={onToggleActive} disabled={isPending}>
          {task.isActive ? "Deactivate" : "Activate"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onDelete}
          disabled={isPending}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      <Alert className="bg-card">
        <CircleAlert className="size-4" />
        <AlertTitle>Deletion is permanent</AlertTitle>
        <AlertDescription>
          Deleting a task removes the linked Activity Log entries because completions
          cascade with the task.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function TaskDetailPane({
  isPending,
  isMobileDetailOpen,
  onDelete,
  onEdit,
  onMobileClose,
  onToggleActive,
  selectedTask,
}: {
  isPending: boolean;
  isMobileDetailOpen: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onMobileClose: (open: boolean) => void;
  onToggleActive: () => void;
  selectedTask: TaskRecord | null;
}) {
  return (
    <>
      {/* Desktop aside */}
      <aside className="hidden bg-background xl:block xl:h-screen xl:overflow-y-auto">
        <div className="p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Context pane
          </p>
          <div className="mt-4">
            {selectedTask ? (
              <TaskDetailContent
                task={selectedTask}
                onEdit={onEdit}
                onToggleActive={onToggleActive}
                onDelete={onDelete}
                isPending={isPending}
              />
            ) : (
              <EmptyState
                title="Select a task"
                description="Choose any row to review metadata and keep actions close to the active list."
              />
            )}
          </div>
        </div>
      </aside>

      {/* Mobile sheet */}
      <Sheet open={isMobileDetailOpen} onOpenChange={onMobileClose}>
        <SheetContent
          side="bottom"
          className="max-h-[88vh] overflow-y-auto rounded-t-[1.25rem]"
        >
          <SheetHeader>
            <SheetTitle>Task detail</SheetTitle>
            <SheetDescription>
              Review the selected task and open the editor without leaving Lists.
            </SheetDescription>
          </SheetHeader>

          {selectedTask ? (
            <div className="mt-5">
              <TaskDetailContent
                task={selectedTask}
                onEdit={onEdit}
                onToggleActive={onToggleActive}
                onDelete={onDelete}
                isPending={isPending}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
