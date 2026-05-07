"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  Check,
  Circle,
  CircleAlert,
  Loader2,
  NotebookPen,
  Plus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getCategoryColor } from "@/lib/category-colors";
import { cn } from "@/lib/utils";

type TaskKind = "RECURRING" | "TODO" | "HABIT";
type TaskCadence = "DAILY" | "WEEKLY" | "MONTHLY" | "ONCE";

type AttributeOption = {
  id: string;
  name: string;
  sortOrder: number;
};

type DashboardTaskItem = {
  attributeId: string;
  attributeName: string;
  cadence: TaskCadence | null;
  completionId: string | null;
  currentPeriodKey: string;
  description: string | null;
  dueDate: string | null;
  isActive: boolean;
  isCompletedNow: boolean;
  note: string | null;
  streak: number | null;
  taskId: string;
  taskKind: TaskKind;
  title: string;
};

type DashboardPayload = {
  date: string;
  attributes: Array<{
    attributeId: string;
    attributeName: string;
    items: DashboardTaskItem[];
  }>;
  error?: string;
};

type AttributesPayload = {
  attributes?: AttributeOption[];
  error?: string;
};

type TaskDetailContentProps = {
  isPending: boolean;
  noteDraft: string;
  onChangeNote: (value: string) => void;
  onClearNote: () => void;
  onSaveNote: () => void;
  task: DashboardTaskItem;
};

const ALL_ATTRIBUTE_VALUE = "__all__";

async function readJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function formatDashboardDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatCadence(cadence: TaskCadence | null, taskKind: TaskKind) {
  if (taskKind === "TODO") {
    return "To-do";
  }

  switch (cadence) {
    case "DAILY":
      return "Daily";
    case "WEEKLY":
      return "Weekly";
    case "MONTHLY":
      return "Monthly";
    case "ONCE":
      return "Once";
    default:
      return taskKind;
  }
}

function formatStreakLabel(task: DashboardTaskItem) {
  const streak = task.streak ?? 0;

  if (task.taskKind === "TODO") {
    return "One-time task";
  }

  if (!streak) {
    return `${formatCadence(task.cadence, task.taskKind)} cadence`;
  }

  const unit =
    task.cadence === "DAILY"
      ? "day"
      : task.cadence === "WEEKLY"
        ? "week"
        : "month";

  return `${streak} ${unit} streak`;
}

function formatTaskSelectionHint(task: DashboardTaskItem) {
  return task.isCompletedNow
    ? "Completed in the active period"
    : "Open in the active period";
}

function CadenceBadge({ task }: { task: DashboardTaskItem }) {
  return (
    <span className="rounded-lg border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.04em] text-muted-foreground">
      {formatCadence(task.cadence, task.taskKind)}
    </span>
  );
}

function StreakBadge({ task }: { task: DashboardTaskItem }) {
  const streak = task.streak ?? 0;

  if (task.taskKind === "TODO") {
    return (
      <span className="font-mono text-[10px] font-medium text-muted-foreground">
        To-do
      </span>
    );
  }

  return (
    <span
      className={cn(
        "font-mono text-[10px] font-semibold",
        streak > 0 ? "text-primary" : "text-muted-foreground",
      )}
    >
      {streak > 0 ? `Streak ${streak}` : "0"}
    </span>
  );
}

function SectionLabel({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex items-center gap-2 px-5 pb-1.5 pt-4">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

function DetailRow({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <div className="text-sm leading-6 text-foreground/85">{children}</div>
    </div>
  );
}

function TaskDetailContent({
  isPending,
  noteDraft,
  onChangeNote,
  onClearNote,
  onSaveNote,
  task,
}: TaskDetailContentProps) {
  const canEditNote = task.isCompletedNow;
  const hasNoteDraft = noteDraft.trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Selected task
        </p>
        <h2 className="text-[15px] font-semibold leading-6 tracking-tight text-foreground">
          {task.title}
        </h2>
        {task.description ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {task.description}
          </p>
        ) : null}
      </div>

      <div className="space-y-4 border-y border-border py-4">
        <DetailRow label="Attribute">
          <span className="inline-flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: getCategoryColor(task.attributeName) }}
            />
            {task.attributeName}
          </span>
        </DetailRow>
        <DetailRow label="Kind">
          <CadenceBadge task={task} />
        </DetailRow>
        <DetailRow label="Status">{formatTaskSelectionHint(task)}</DetailRow>
        <DetailRow label="Streak">{formatStreakLabel(task)}</DetailRow>
        {task.taskKind !== "TODO" ? (
          <DetailRow label="Period">{task.currentPeriodKey}</DetailRow>
        ) : null}
        {task.dueDate ? (
          <DetailRow label="Due">
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(task.dueDate))}
          </DetailRow>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="today-note"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Current period note
        </Label>
        <Textarea
          id="today-note"
          value={noteDraft}
          onChange={(event) => onChangeNote(event.target.value)}
          placeholder={
            canEditNote
              ? "Add a note for this completion."
              : "Complete the task first to attach a note."
          }
          disabled={isPending || !canEditNote}
          className="min-h-24 resize-none rounded-lg bg-card text-sm shadow-none"
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Notes stay attached to the current completion.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={onSaveNote}
          disabled={
            isPending || !canEditNote || noteDraft.trim() === (task.note ?? "")
          }
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <NotebookPen className="size-4" />
          )}
          Save note
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onClearNote}
          disabled={isPending || !canEditNote || !hasNoteDraft}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

function TaskRow({
  isPending,
  onOpenMobileDetail,
  onSelect,
  onToggle,
  task,
  selected,
}: {
  isPending: boolean;
  onOpenMobileDetail: () => void;
  onSelect: () => void;
  onToggle: () => void;
  task: DashboardTaskItem;
  selected: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-5 py-2.5 transition-colors duration-[160ms] ease-out last:border-b-0",
        selected
          ? "bg-accent"
          : task.isCompletedNow
            ? "bg-background/45"
            : "bg-card hover:bg-muted/35",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={isPending}
        className={cn(
          "flex size-5 items-center justify-center rounded-full border transition-[background-color,border-color,color] duration-[160ms] ease-out disabled:opacity-50",
          task.isCompletedNow
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-transparent text-muted-foreground hover:border-primary",
        )}
      >
        {task.isCompletedNow ? (
          <Check className="size-3" />
        ) : (
          <Circle className="size-3.5" />
        )}
        <span className="sr-only">
          {task.isCompletedNow ? "Uncheck task" : "Check task"}
        </span>
      </button>

      <button type="button" onClick={onSelect} className="min-w-0 text-left">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className={cn(
              "truncate text-[13px] font-medium leading-5",
              task.isCompletedNow
                ? "text-muted-foreground line-through"
                : "text-foreground",
            )}
          >
            {task.title}
          </p>
          {!task.isActive ? (
            <span className="shrink-0 rounded-lg border border-border bg-background px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Inactive
            </span>
          ) : null}
        </div>

        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: getCategoryColor(task.attributeName) }}
            />
            <span className="truncate">{task.attributeName}</span>
          </span>
          <CadenceBadge task={task} />
          {task.note ? (
            <span className="max-w-[14rem] truncate italic">{task.note}</span>
          ) : null}
        </div>
      </button>

      <div className="flex items-center gap-2 justify-self-end">
        <StreakBadge task={task} />
        <Button
          size="sm"
          variant={selected ? "secondary" : "outline"}
          className="h-8 px-2 text-xs xl:hidden"
          onClick={onOpenMobileDetail}
        >
          <NotebookPen className="size-4" />
          Detail
        </Button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="py-2">
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <section key={sectionIndex}>
          <div className="flex items-center gap-2 px-5 pb-1.5 pt-4">
            <Skeleton className="h-3 w-28 rounded-sm" />
            <Skeleton className="h-3 w-5 rounded-sm" />
          </div>
          <div className="border-t border-border">
            {Array.from({ length: 3 }).map((__, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[2rem_minmax(0,1fr)_4.5rem] items-center gap-2 border-b border-border px-5 py-3"
              >
                <Skeleton className="size-5 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-44 rounded-sm" />
                  <Skeleton className="h-3 w-32 rounded-sm" />
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

export function DashboardScreen() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [attributeOptions, setAttributeOptions] = useState<AttributeOption[]>([]);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(
    null,
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadDashboard = useCallback(
    async (options?: {
      attributeId?: string | null;
      includeInactive?: boolean;
    }) => {
      const attributeId = options?.attributeId ?? selectedAttributeId;
      const nextIncludeInactive = options?.includeInactive ?? includeInactive;
      const searchParams = new URLSearchParams();

      if (attributeId) {
        searchParams.set("attributeId", attributeId);
      }

      if (nextIncludeInactive) {
        searchParams.set("includeInactive", "true");
      }

      const response = await fetch(
        `/api/dashboard?${searchParams.toString()}`,
        {
          cache: "no-store",
        },
      );
      const payload = await readJson<DashboardPayload>(response);

      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? "Failed to load today.");
      }

      setDashboard(payload);
    },
    [includeInactive, selectedAttributeId],
  );

  const loadAttributes = useCallback(async () => {
    const response = await fetch("/api/attributes", {
      cache: "no-store",
    });
    const payload = await readJson<AttributesPayload>(response);

    if (!response.ok || !payload?.attributes) {
      throw new Error(payload?.error ?? "Failed to load attributes.");
    }

    setAttributeOptions(payload.attributes);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await Promise.all([loadDashboard(), loadAttributes()]);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load today.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadAttributes, loadDashboard]);

  const taskItems = useMemo(() => {
    return dashboard?.attributes.flatMap((attribute) => attribute.items) ?? [];
  }, [dashboard]);

  const visibleAttributes = useMemo(() => {
    return (
      dashboard?.attributes.filter((attribute) => attribute.items.length > 0) ??
      []
    );
  }, [dashboard]);

  const selectedTask = useMemo(() => {
    if (!taskItems.length) {
      return null;
    }

    return (
      taskItems.find((task) => task.taskId === selectedTaskId) ??
      taskItems[0]
    );
  }, [taskItems, selectedTaskId]);

  useEffect(() => {
    if (!selectedTask) {
      setNoteDraft("");
      return;
    }

    setSelectedTaskId(selectedTask.taskId);
    setNoteDraft(selectedTask.note ?? "");
  }, [selectedTask]);

  const stats = useMemo(() => {
    const completedItems = taskItems.filter(
      (task) => task.isCompletedNow,
    ).length;
    const bestStreak = taskItems.reduce((best, task) => {
      return Math.max(best, task.streak ?? 0);
    }, 0);

    return {
      bestStreak,
      completedItems,
      totalItems: taskItems.length,
    };
  }, [taskItems]);

  const refreshDashboard = (nextState?: {
    attributeId?: string | null;
    includeInactive?: boolean;
  }) => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await loadDashboard(nextState);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to refresh today.",
        );
      }
    });
  };

  const handleToggleTask = (task: DashboardTaskItem) => {
    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch(
        `/api/tasks/${task.taskId}/current-completion`,
        {
          method: task.isCompletedNow ? "DELETE" : "PUT",
          headers: {
            "content-type": "application/json",
          },
          body: task.isCompletedNow ? undefined : JSON.stringify({}),
        },
      );
      const payload = await readJson<{ error?: string }>(response);

      if (!response.ok && response.status !== 204) {
        setErrorMessage(payload?.error ?? "Failed to update task completion.");
        return;
      }

      toast.success(
        task.isCompletedNow
          ? `Unchecked "${task.title}" for the active period.`
          : `Completed "${task.title}" for the active period.`,
      );
      await loadDashboard();
    });
  };

  const persistNote = (nextNote: string | null) => {
    if (!selectedTask?.completionId) {
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch(
        `/api/completions/${selectedTask.completionId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            note: nextNote,
          }),
        },
      );
      const payload = await readJson<{ error?: string }>(response);

      if (!response.ok) {
        setErrorMessage(payload?.error ?? "Failed to save note.");
        return;
      }

      toast.success(
        nextNote
          ? `Saved note for "${selectedTask.title}".`
          : `Cleared note for "${selectedTask.title}".`,
      );
      await loadDashboard();
    });
  };

  const handleSaveNote = () => {
    persistNote(noteDraft.trim() ? noteDraft.trim() : null);
  };

  const handleClearNote = () => {
    setNoteDraft("");
    persistNote(null);
  };

  const openMobileDetail = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsMobileDetailOpen(true);
  };

  const hasNoItems = !isLoading && !taskItems.length;
  const canResetFilters = Boolean(selectedAttributeId || includeInactive);
  const currentDateLabel = dashboard
    ? formatDashboardDate(dashboard.date)
    : "Loading today";

  return (
    <>
      <div className="min-h-[calc(100vh-4.25rem)] bg-card lg:h-screen lg:min-h-0 xl:grid xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 border-border bg-card xl:h-screen xl:overflow-y-auto xl:border-r">
          <section className="border-b border-border bg-card lg:sticky lg:top-0 lg:z-10">
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-[22px] font-semibold leading-7 tracking-tight text-foreground">
                  Today
                </h1>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {currentDateLabel} |{" "}
                  {isLoading
                    ? "loading task counts"
                    : `${stats.completedItems}/${stats.totalItems} complete | best streak ${stats.bestStreak}`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refreshDashboard()}
                  disabled={isPending || isLoading}
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  Refresh
                </Button>
                <Button asChild size="sm">
                  <Link href="/lists">
                    <Plus className="size-4" />
                    Add task
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-2 border-t border-border px-5 py-3 md:grid-cols-[minmax(0,1fr)_14rem_auto] md:items-end">
              <div className="space-y-1.5">
                <Label
                  htmlFor="today-attribute-filter"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  Filter by attribute
                </Label>
                <Select
                  value={selectedAttributeId ?? ALL_ATTRIBUTE_VALUE}
                  onValueChange={(value) => {
                    const nextAttributeId =
                      value === ALL_ATTRIBUTE_VALUE ? null : value;

                    setSelectedAttributeId(nextAttributeId);
                    refreshDashboard({ attributeId: nextAttributeId });
                  }}
                  disabled={isPending || isLoading}
                >
                  <SelectTrigger
                    id="today-attribute-filter"
                    aria-label="Filter by attribute"
                    className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                  >
                    <SelectValue placeholder="All attributes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_ATTRIBUTE_VALUE}>
                      All attributes
                    </SelectItem>
                    {attributeOptions.map((attribute) => (
                      <SelectItem key={attribute.id} value={attribute.id}>
                        {attribute.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
                <Checkbox
                  checked={includeInactive}
                  onCheckedChange={(checked) => {
                    const nextValue = checked === true;

                    setIncludeInactive(nextValue);
                    refreshDashboard({ includeInactive: nextValue });
                  }}
                  disabled={isPending}
                  className="size-4 rounded-sm shadow-none"
                />
                <span className="font-medium">Show inactive</span>
              </label>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedAttributeId(null);
                  setIncludeInactive(false);
                  refreshDashboard({
                    attributeId: null,
                    includeInactive: false,
                  });
                }}
                disabled={isPending || !canResetFilters}
                className="h-9 justify-self-start px-3 md:justify-self-end"
              >
                Reset filters
              </Button>
            </div>
          </section>

          {errorMessage ? (
            <div className="px-5 pt-4">
              <Alert variant="destructive">
                <CircleAlert className="size-4" />
                <AlertTitle>Today update failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          {isLoading ? (
            <DashboardSkeleton />
          ) : hasNoItems ? (
            <div className="p-5">
              <EmptyState
                title="No tasks in this view"
                description="Today is empty right now. Add a task or broaden the filters to bring more work into the current surface."
                action={
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href="/lists">Open Lists</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/attributes">Open Attributes</Link>
                    </Button>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="pb-5">
              {visibleAttributes.map((attribute) => (
                <section key={attribute.attributeId}>
                  <SectionLabel
                    label={attribute.attributeName}
                    count={attribute.items.length}
                  />
                  <div className="border-t border-border">
                    {attribute.items.map((task) => {
                      const selected = selectedTask?.taskId === task.taskId;

                      return (
                        <TaskRow
                          key={task.taskId}
                          task={task}
                          selected={selected}
                          isPending={isPending}
                          onToggle={() => handleToggleTask(task)}
                          onSelect={() => setSelectedTaskId(task.taskId)}
                          onOpenMobileDetail={() =>
                            openMobileDetail(task.taskId)
                          }
                        />
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <aside className="hidden bg-background xl:block xl:h-screen xl:overflow-y-auto">
          <div className="p-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Context pane
            </p>

            <div className="mt-4">
              {selectedTask ? (
                <TaskDetailContent
                  task={selectedTask}
                  noteDraft={noteDraft}
                  onChangeNote={setNoteDraft}
                  onClearNote={handleClearNote}
                  onSaveNote={handleSaveNote}
                  isPending={isPending}
                />
              ) : (
                <EmptyState
                  title="Select a task"
                  description="Pick any row to inspect the current period and keep note editing inside the Today flow."
                />
              )}
            </div>
          </div>
        </aside>
      </div>

      <Sheet open={isMobileDetailOpen} onOpenChange={setIsMobileDetailOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[88vh] overflow-y-auto rounded-t-[1.25rem]"
        >
          <SheetHeader>
            <SheetTitle>Task detail</SheetTitle>
            <SheetDescription>
              Keep note editing and period context inside Today.
            </SheetDescription>
          </SheetHeader>

          {selectedTask ? (
            <div className="mt-5">
              <TaskDetailContent
                task={selectedTask}
                noteDraft={noteDraft}
                onChangeNote={setNoteDraft}
                onClearNote={handleClearNote}
                onSaveNote={handleSaveNote}
                isPending={isPending}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
