"use client";

import Link from "next/link";
import { PencilLine, Plus } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { ItemBadge } from "@/components/ui/item-badge";
import { SectionLabel } from "@/components/ui/section-label";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryColor } from "@/lib/category-colors";
import { cn } from "@/lib/utils";
import { type Group } from "@/hooks/use-grouped-items";
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

function TaskListSkeleton() {
  return (
    <div className="py-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <section key={index}>
          <div className="flex items-center gap-2 px-5 pb-1.5 pt-4">
            <Skeleton className="h-3 w-32 rounded-sm" />
            <Skeleton className="h-3 w-5 rounded-sm" />
          </div>
          <div className="border-t border-border">
            {Array.from({ length: 3 }).map((__, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-2 border-b border-border px-5 py-3"
              >
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-40 rounded-sm" />
                  <Skeleton className="h-3 w-28 rounded-sm" />
                </div>
                <Skeleton className="h-3 w-14 justify-self-end rounded-sm" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function TaskListSection({
  groupedTasks,
  hasNoAttributes,
  hasNoVisibleTasks,
  isLoading,
  onEdit,
  onMobileSelect,
  onSelect,
  openCreateForm,
  selectedTask,
}: {
  groupedTasks: Group<TaskRecord>[];
  hasNoAttributes: boolean;
  hasNoVisibleTasks: boolean;
  isLoading: boolean;
  onEdit: (task: TaskRecord) => void;
  onMobileSelect: (taskId: string) => void;
  onSelect: (taskId: string) => void;
  openCreateForm: () => void;
  selectedTask: TaskRecord | null;
}) {
  if (isLoading) return <TaskListSkeleton />;

  if (hasNoAttributes) {
    return (
      <div className="p-5">
        <EmptyState
          title="Create attributes before tasks"
          description="Tasks always belong to an attribute. Set up at least one attribute first, then come back here to build the task library."
          action={
            <Button asChild>
              <Link href="/attributes">Manage Attributes</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (hasNoVisibleTasks) {
    return (
      <div className="p-5">
        <EmptyState
          title="No tasks match the current view"
          description="Add your first task or relax the filters if this list view is too narrow."
          action={
            <div className="flex flex-wrap gap-3">
              <Button onClick={openCreateForm}>
                <Plus className="size-4" />
                Add task
              </Button>
              <Button asChild variant="outline">
                <Link href="/attributes">Open Attributes</Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="pb-5">
      {groupedTasks.map((group) => (
        <section key={group.id}>
          <SectionLabel label={group.name} count={group.items.length} />
          <div className="border-t border-border">
            {group.items.map((task) => {
              const selected = selectedTask?.id === task.id;

              return (
                <div
                  key={task.id}
                  className={cn(
                    "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-5 py-2.5 transition-colors duration-[160ms] ease-out last:border-b-0",
                    selected ? "bg-accent" : "bg-card hover:bg-muted/35",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(task.id)}
                    className="min-w-0 text-left"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-[13px] font-medium leading-5 text-foreground">
                        {task.title}
                      </p>
                      <KindBadge taskKind={task.taskKind} cadence={task.cadence} />
                      {!task.isActive ? (
                        <span className="shrink-0 rounded-lg border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <span
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: getCategoryColor(task.attribute.name) }}
                        />
                        <span className="truncate">{task.attribute.name}</span>
                      </span>
                      <span className="font-mono text-[10px]">
                        Updated {formatTimestamp(task.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs leading-5 text-muted-foreground">
                      {task.description ?? "No description yet."}
                    </p>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant={selected ? "secondary" : "outline"}
                      className="hidden h-8 px-2 text-xs xl:inline-flex"
                      onClick={() => onSelect(task.id)}
                    >
                      Detail
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs xl:hidden"
                      onClick={() => onMobileSelect(task.id)}
                    >
                      Detail
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs"
                      onClick={() => onEdit(task)}
                    >
                      <PencilLine className="size-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
