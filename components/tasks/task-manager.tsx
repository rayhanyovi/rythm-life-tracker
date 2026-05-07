"use client";

import Link from "next/link";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAutoSelect } from "@/hooks/use-auto-select";
import { useGroupedItems } from "@/hooks/use-grouped-items";
import { useMutation } from "@/hooks/use-mutation";
import {
  CircleAlert,
  Loader2,
  PencilLine,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/app/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getCategoryColor } from "@/lib/category-colors";
import { cn } from "@/lib/utils";

type TaskKind = "RECURRING" | "TODO" | "HABIT";
type TaskCadence = "DAILY" | "WEEKLY" | "MONTHLY";

type AttributeRecord = {
  id: string;
  name: string;
  sortOrder: number;
};

type TaskRecord = {
  id: string;
  attributeId: string;
  title: string;
  description: string | null;
  taskKind: TaskKind;
  cadence: TaskCadence | null;
  dueDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  attribute: AttributeRecord;
};

type TasksPayload = {
  tasks?: TaskRecord[];
  error?: string;
};

type AttributesPayload = {
  attributes?: AttributeRecord[];
  error?: string;
};

type TaskMutationPayload = {
  task?: TaskRecord;
  error?: string;
};

type DeletePayload = {
  error?: string;
};

type TaskFormState = {
  attributeId: string;
  title: string;
  description: string;
  taskKind: TaskKind;
  cadence: TaskCadence | "";
  dueDate: string;
  isActive: boolean;
};

const TASK_KINDS: TaskKind[] = ["RECURRING", "TODO"];
const TASK_CADENCES: TaskCadence[] = ["DAILY", "WEEKLY", "MONTHLY"];
const ALL_ATTRIBUTE_VALUE = "__all__";
const ALL_KIND_VALUE = "__all__";

const TASK_KIND_LABELS: Record<TaskKind, string> = {
  RECURRING: "Recurring",
  TODO: "To-do",
  HABIT: "Habit",
};

const CADENCE_LABELS: Record<TaskCadence, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

async function readJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function createEmptyFormState(attributes: AttributeRecord[]): TaskFormState {
  return {
    attributeId: attributes[0]?.id ?? "",
    title: "",
    description: "",
    taskKind: "RECURRING",
    cadence: "DAILY",
    dueDate: "",
    isActive: true,
  };
}

function createFormStateFromTask(task: TaskRecord): TaskFormState {
  return {
    attributeId: task.attributeId,
    title: task.title,
    description: task.description ?? "",
    taskKind: task.taskKind,
    cadence: (task.cadence as TaskCadence | null) ?? "",
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    isActive: task.isActive,
  };
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function KindBadge({ taskKind, cadence }: { taskKind: TaskKind; cadence: TaskCadence | null }) {
  let label: string;

  if (taskKind === "RECURRING" && cadence) {
    label = CADENCE_LABELS[cadence];
  } else {
    label = TASK_KIND_LABELS[taskKind];
  }

  return (
    <span className="rounded-lg border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.04em] text-muted-foreground">
      {label}
    </span>
  );
}

function SectionLabel({
  count,
  label,
}: {
  count: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-5 pb-1.5 pt-4">
      <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: getCategoryColor(label) }}
        />
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

function TaskFormFields({
  attributes,
  formError,
  formState,
  isPending,
  onChange,
}: {
  attributes: AttributeRecord[];
  formError: string | null;
  formState: TaskFormState;
  isPending: boolean;
  onChange: (updater: (current: TaskFormState) => TaskFormState) => void;
}) {
  return (
    <div className="space-y-5">
      {formError ? (
        <Alert variant="destructive">
          <CircleAlert className="size-4" />
          <AlertTitle>Could not save task</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-1.5">
        <Label
          htmlFor="list-task-title"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Title
        </Label>
        <Input
          id="list-task-title"
          value={formState.title}
          onChange={(event) =>
            onChange((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Morning review, QA pass, Read 10 pages"
          disabled={isPending}
          className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="list-task-description"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Description
        </Label>
        <Textarea
          id="list-task-description"
          value={formState.description}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          placeholder="Optional context for this task."
          disabled={isPending}
          className="min-h-28 resize-none rounded-lg bg-background text-sm shadow-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="list-task-attribute"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Attribute
        </Label>
        <Select
          value={formState.attributeId}
          onValueChange={(value) =>
            onChange((current) => ({ ...current, attributeId: value }))
          }
          disabled={isPending || attributes.length === 0}
        >
          <SelectTrigger
            id="list-task-attribute"
            className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
          >
            <SelectValue placeholder="Choose an attribute" />
          </SelectTrigger>
          <SelectContent>
            {attributes.map((attribute) => (
              <SelectItem key={attribute.id} value={attribute.id}>
                {attribute.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="list-task-kind"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Task type
        </Label>
        <Select
          value={formState.taskKind}
          onValueChange={(value) =>
            onChange((current) => ({
              ...current,
              taskKind: value as TaskKind,
              cadence: value === "RECURRING" ? (current.cadence || "DAILY") : "",
              dueDate: value === "TODO" ? current.dueDate : "",
            }))
          }
          disabled={isPending}
        >
          <SelectTrigger
            id="list-task-kind"
            className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
          >
            <SelectValue placeholder="Choose a type" />
          </SelectTrigger>
          <SelectContent>
            {TASK_KINDS.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {TASK_KIND_LABELS[kind]}
              </SelectItem>
            ))}
            <SelectItem value="HABIT" disabled>
              Habit (coming soon)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formState.taskKind === "RECURRING" ? (
        <div className="space-y-1.5">
          <Label
            htmlFor="list-task-cadence"
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
          >
            Cadence
          </Label>
          <Select
            value={formState.cadence}
            onValueChange={(value) =>
              onChange((current) => ({ ...current, cadence: value as TaskCadence }))
            }
            disabled={isPending}
          >
            <SelectTrigger
              id="list-task-cadence"
              className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
            >
              <SelectValue placeholder="Choose a recurrence" />
            </SelectTrigger>
            <SelectContent>
              {TASK_CADENCES.map((cadence) => (
                <SelectItem key={cadence} value={cadence}>
                  {CADENCE_LABELS[cadence]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {formState.taskKind === "TODO" ? (
        <div className="space-y-1.5">
          <Label
            htmlFor="list-task-due-date"
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
          >
            Due date{" "}
            <span className="normal-case tracking-normal text-muted-foreground/70">
              (optional)
            </span>
          </Label>
          <Input
            id="list-task-due-date"
            type="date"
            value={formState.dueDate}
            onChange={(event) =>
              onChange((current) => ({ ...current, dueDate: event.target.value }))
            }
            disabled={isPending}
            className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for backlog-only. Set a date to make it appear on Today when due.
          </p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Status
        </Label>
        <label className="flex min-h-10 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-none">
          <Checkbox
            checked={formState.isActive}
            onCheckedChange={(checked) =>
              onChange((current) => ({ ...current, isActive: checked === true }))
            }
            disabled={isPending}
          />
          <span className="font-medium text-foreground">Task is active</span>
        </label>
      </div>
    </div>
  );
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
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleActive}
          disabled={isPending}
        >
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

export function TaskManager() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [attributes, setAttributes] = useState<AttributeRecord[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [selectedTaskKind, setSelectedTaskKind] = useState<TaskKind | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formState, setFormState] = useState<TaskFormState>(
    createEmptyFormState([]),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskRecord | null>(null);
  const { errorMessage, isPending, runMutation, setError } = useMutation();

  const fetchAttributes = useCallback(async () => {
    const response = await fetch("/api/attributes", {
      cache: "no-store",
    });
    const payload = await readJson<AttributesPayload>(response);

    if (!response.ok || !payload?.attributes) {
      throw new Error(payload?.error ?? "Failed to load attributes.");
    }

    return payload.attributes;
  }, []);

  const fetchTasks = useCallback(
    async (options?: {
      search?: string;
      attributeId?: string | null;
      taskKind?: TaskKind | null;
      includeInactive?: boolean;
    }) => {
      const search = options?.search ?? deferredSearch.trim();
      const attributeId = options?.attributeId ?? selectedAttributeId;
      const taskKind = options?.taskKind ?? selectedTaskKind;
      const nextIncludeInactive = options?.includeInactive ?? includeInactive;
      const searchParams = new URLSearchParams();

      if (search) searchParams.set("search", search);
      if (attributeId) searchParams.set("attributeId", attributeId);
      if (taskKind) searchParams.set("taskKind", taskKind);
      if (nextIncludeInactive) searchParams.set("includeInactive", "true");

      const query = searchParams.toString();
      const response = await fetch(query ? `/api/tasks?${query}` : "/api/tasks", {
        cache: "no-store",
      });
      const payload = await readJson<TasksPayload>(response);

      if (!response.ok || !payload?.tasks) {
        throw new Error(payload?.error ?? "Failed to load tasks.");
      }

      return payload.tasks;
    },
    [deferredSearch, includeInactive, selectedAttributeId, selectedTaskKind],
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const nextAttributes = await fetchAttributes();

        if (!cancelled) {
          setAttributes(nextAttributes);
          setFormState((current) => {
            if (current.attributeId || nextAttributes.length === 0) {
              return current;
            }

            return { ...current, attributeId: nextAttributes[0].id };
          });
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load attributes.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAttributes(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchAttributes, setError]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);

      try {
        const nextTasks = await fetchTasks();

        if (!cancelled) {
          setTasks(nextTasks);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load tasks.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTasks(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchTasks, setError]);

  const selectedTask = useAutoSelect(tasks, selectedTaskId, setSelectedTaskId);

  const groupedTasks = useGroupedItems(
    tasks,
    "attributeId",
    (task) => task.attribute.name,
  );

  const stats = useMemo(() => {
    const activeCount = tasks.filter((task) => task.isActive).length;

    return {
      visible: tasks.length,
      active: activeCount,
      inactive: tasks.length - activeCount,
    };
  }, [tasks]);

  const hasNoAttributes = !isLoadingAttributes && attributes.length === 0;
  const hasNoVisibleTasks = !isLoadingTasks && !hasNoAttributes && tasks.length === 0;
  const hasActiveFilters =
    searchInput.trim().length > 0 ||
    selectedAttributeId !== null ||
    selectedTaskKind !== null ||
    includeInactive;

  const closeForm = () => {
    setFormMode(null);
    setEditingTaskId(null);
    setFormError(null);
  };

  const refreshTasks = async () => {
    const nextTasks = await fetchTasks();
    setTasks(nextTasks);
  };

  const openCreateForm = () => {
    if (!attributes.length) {
      setError("Create an attribute first before adding tasks.");
      return;
    }

    setFormMode("create");
    setEditingTaskId(null);
    setFormError(null);
    setFormState(createEmptyFormState(attributes));
  };

  const openEditForm = (task: TaskRecord) => {
    setFormMode("edit");
    setEditingTaskId(task.id);
    setFormError(null);
    setFormState(createFormStateFromTask(task));
  };

  const handleSaveTask = () => {
    const title = formState.title.trim();

    if (!title) {
      setFormError("Title is required.");
      return;
    }

    if (!formState.attributeId) {
      setFormError("Attribute is required.");
      return;
    }

    if (formState.taskKind === "RECURRING" && !formState.cadence) {
      setFormError("Cadence is required for recurring tasks.");
      return;
    }

    setFormError(null);

    runMutation(async () => {
      const isEditing = formMode === "edit" && editingTaskId;

      const body: Record<string, unknown> = {
        attributeId: formState.attributeId,
        title,
        description: formState.description,
        isActive: formState.isActive,
      };

      if (!isEditing) {
        body.taskKind = formState.taskKind;
      }

      if (formState.taskKind === "RECURRING" && formState.cadence) {
        body.cadence = formState.cadence;
      }

      if (formState.taskKind === "TODO" && formState.dueDate) {
        body.dueDate = formState.dueDate;
      } else if (formState.taskKind === "TODO" && !formState.dueDate) {
        body.dueDate = null;
      }

      const response = await fetch(
        isEditing ? `/api/tasks/${editingTaskId}` : "/api/tasks",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );
      const payload = await readJson<TaskMutationPayload>(response);

      if (!response.ok || !payload?.task) {
        setFormError(payload?.error ?? "Failed to save task.");
        return;
      }

      toast.success(isEditing ? `Updated "${title}".` : `Created "${title}".`);
      closeForm();
      setSelectedTaskId(payload.task.id);
      await refreshTasks();
    });
  };

  const handleToggleActive = (task: TaskRecord) => {
    runMutation(async () => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          isActive: !task.isActive,
        }),
      });
      const payload = await readJson<TaskMutationPayload>(response);

      if (!response.ok || !payload?.task) {
        throw new Error(payload?.error ?? "Failed to update task status.");
      }

      toast.success(
        payload.task.isActive
          ? `Reactivated "${payload.task.title}".`
          : `Deactivated "${payload.task.title}".`,
      );

      if (editingTaskId === task.id) {
        setFormState(createFormStateFromTask(payload.task));
      }

      await refreshTasks();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    runMutation(async () => {
      const response = await fetch(`/api/tasks/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const payload = await readJson<DeletePayload>(response);

      if (!response.ok && response.status !== 204) {
        throw new Error(payload?.error ?? "Failed to delete task.");
      }

      toast.success(`Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);

      if (selectedTaskId === deleteTarget.id) {
        setSelectedTaskId(null);
      }

      await refreshTasks();
    });
  };

  return (
    <>
      <div className="min-h-[calc(100vh-4.25rem)] bg-card lg:h-screen lg:min-h-0 xl:grid xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 border-border bg-card xl:h-screen xl:overflow-y-auto xl:border-r">
          <section className="border-b border-border bg-card lg:sticky lg:top-0 lg:z-10">
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-[22px] font-semibold leading-7 tracking-tight text-foreground">
                  Lists
                </h1>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {isLoadingTasks
                    ? "loading task library"
                    : `${stats.visible} visible | ${stats.active} active | ${stats.inactive} inactive`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={openCreateForm}
                  disabled={isPending || hasNoAttributes}
                >
                  <Plus className="size-4" />
                  Add task
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/attributes">Open Attributes</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-2 border-t border-border px-5 py-3 md:grid-cols-[minmax(0,1fr)_13rem_11rem] md:items-center">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search tasks by title or description"
                  className="h-9 rounded-lg bg-background px-3 py-2 pl-9 text-sm shadow-none"
                />
              </div>
              <Select
                value={selectedAttributeId ?? ALL_ATTRIBUTE_VALUE}
                onValueChange={(value) =>
                  setSelectedAttributeId(value === ALL_ATTRIBUTE_VALUE ? null : value)
                }
                disabled={isPending || isLoadingAttributes}
              >
                <SelectTrigger
                  aria-label="Filter tasks by attribute"
                  className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                >
                  <SelectValue placeholder="All attributes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ATTRIBUTE_VALUE}>All attributes</SelectItem>
                  {attributes.map((attribute) => (
                    <SelectItem key={attribute.id} value={attribute.id}>
                      {attribute.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedTaskKind ?? ALL_KIND_VALUE}
                onValueChange={(value) =>
                  setSelectedTaskKind(
                    value === ALL_KIND_VALUE ? null : (value as TaskKind),
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger
                  aria-label="Filter tasks by type"
                  className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                >
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_KIND_VALUE}>All types</SelectItem>
                  {TASK_KINDS.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {TASK_KIND_LABELS[kind]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 border-t border-border px-5 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <label className="flex min-h-9 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-none">
                <Checkbox
                  checked={includeInactive}
                  onCheckedChange={(checked) => setIncludeInactive(checked === true)}
                  disabled={isPending}
                />
                <span className="font-medium text-foreground">Show inactive tasks</span>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setSelectedAttributeId(null);
                  setSelectedTaskKind(null);
                  setIncludeInactive(false);
                }}
                disabled={!hasActiveFilters || isPending}
              >
                Reset filters
              </Button>
            </div>
          </section>

          {errorMessage ? (
            <div className="px-5 pt-4">
              <Alert variant="destructive">
                <CircleAlert className="size-4" />
                <AlertTitle>Lists update failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          {isLoadingAttributes || isLoadingTasks ? (
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
          ) : hasNoAttributes ? (
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
          ) : hasNoVisibleTasks ? (
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
          ) : (
            <div className="pb-5">
              {groupedTasks.map((group) => (
                <section key={group.id}>
                  <SectionLabel
                    label={group.name}
                    count={group.items.length}
                  />
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
                            onClick={() => setSelectedTaskId(task.id)}
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
                                  style={{
                                    backgroundColor: getCategoryColor(
                                      task.attribute.name,
                                    ),
                                  }}
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
                              onClick={() => setSelectedTaskId(task.id)}
                            >
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs xl:hidden"
                              onClick={() => {
                                setSelectedTaskId(task.id);
                                setIsMobileDetailOpen(true);
                              }}
                            >
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs"
                              onClick={() => openEditForm(task)}
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
                  onEdit={() => openEditForm(selectedTask)}
                  onToggleActive={() => handleToggleActive(selectedTask)}
                  onDelete={() => setDeleteTarget(selectedTask)}
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
      </div>

      <Sheet
        open={Boolean(formMode)}
        onOpenChange={(open) => {
          if (!open) {
            closeForm();
          }
        }}
      >
        <SheetContent className="w-[92vw] max-w-xl gap-6">
          <SheetHeader>
            <SheetTitle>{formMode === "edit" ? "Edit task" : "Create task"}</SheetTitle>
            <SheetDescription>
              {formMode === "edit"
                ? "Update the task details below."
                : "Fill in the details for your new task. Type determines how it appears on Today."}
            </SheetDescription>
          </SheetHeader>

          <div className="overflow-y-auto pr-1">
            <TaskFormFields
              attributes={attributes}
              formError={formError}
              formState={formState}
              isPending={isPending}
              onChange={(updater) => setFormState((current) => updater(current))}
            />
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={closeForm} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask} disabled={isPending || hasNoAttributes}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : formMode === "edit" ? (
                <PencilLine className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {formMode === "edit" ? "Save changes" : "Create task"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={isMobileDetailOpen} onOpenChange={setIsMobileDetailOpen}>
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
                onEdit={() => {
                  setIsMobileDetailOpen(false);
                  openEditForm(selectedTask);
                }}
                onToggleActive={() => handleToggleActive(selectedTask)}
                onDelete={() => setDeleteTarget(selectedTask)}
                isPending={isPending}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteTarget?.title}&quot; only if you accept losing the
              linked Activity Log entries as well. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
