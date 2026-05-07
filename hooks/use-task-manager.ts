"use client";

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAutoSelect } from "@/hooks/use-auto-select";
import { useGroupedItems } from "@/hooks/use-grouped-items";
import { useMutation } from "@/hooks/use-mutation";
import { type Group } from "@/hooks/use-grouped-items";
import { toast } from "sonner";

import {
  type AttributeRecord,
  type AttributesPayload,
  type DeletePayload,
  type TaskFormState,
  type TaskKind,
  type TaskMutationPayload,
  type TaskRecord,
  type TasksPayload,
  createEmptyFormState,
  createFormStateFromTask,
  readTaskJson,
} from "@/components/tasks/task-types";

export type TaskManagerState = {
  // data
  tasks: TaskRecord[];
  attributes: AttributeRecord[];
  groupedTasks: Group<TaskRecord>[];
  selectedTask: TaskRecord | null;
  stats: { visible: number; active: number; inactive: number };
  // filter state
  searchInput: string;
  selectedAttributeId: string | null;
  selectedTaskKind: TaskKind | null;
  includeInactive: boolean;
  // ui state
  isMobileDetailOpen: boolean;
  isLoadingAttributes: boolean;
  isLoadingTasks: boolean;
  formMode: "create" | "edit" | null;
  formState: TaskFormState;
  formError: string | null;
  deleteTarget: TaskRecord | null;
  // mutation state
  errorMessage: string | null;
  isPending: boolean;
  // computed
  hasNoAttributes: boolean;
  hasNoVisibleTasks: boolean;
  hasActiveFilters: boolean;
  // setters
  setSearchInput: Dispatch<SetStateAction<string>>;
  setSelectedAttributeId: Dispatch<SetStateAction<string | null>>;
  setSelectedTaskKind: Dispatch<SetStateAction<TaskKind | null>>;
  setIncludeInactive: Dispatch<SetStateAction<boolean>>;
  setSelectedTaskId: Dispatch<SetStateAction<string | null>>;
  setIsMobileDetailOpen: Dispatch<SetStateAction<boolean>>;
  setDeleteTarget: Dispatch<SetStateAction<TaskRecord | null>>;
  setFormState: Dispatch<SetStateAction<TaskFormState>>;
  // handlers
  openCreateForm: () => void;
  openEditForm: (task: TaskRecord) => void;
  closeForm: () => void;
  handleSaveTask: () => void;
  handleToggleActive: (task: TaskRecord) => void;
  handleDelete: () => void;
};

export function useTaskManager(): TaskManagerState {
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
  const [formState, setFormState] = useState<TaskFormState>(createEmptyFormState([]));
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskRecord | null>(null);
  const { errorMessage, isPending, runMutation, setError } = useMutation();

  const fetchAttributes = useCallback(async () => {
    const response = await fetch("/api/attributes", { cache: "no-store" });
    const payload = await readTaskJson<AttributesPayload>(response);

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
      const response = await fetch(
        query ? `/api/tasks?${query}` : "/api/tasks",
        { cache: "no-store" },
      );
      const payload = await readTaskJson<TasksPayload>(response);

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
            if (current.attributeId || nextAttributes.length === 0) return current;
            return { ...current, attributeId: nextAttributes[0].id };
          });
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Failed to load attributes.");
        }
      } finally {
        if (!cancelled) setIsLoadingAttributes(false);
      }
    }

    void run();
    return () => { cancelled = true; };
  }, [fetchAttributes, setError]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);

      try {
        const nextTasks = await fetchTasks();
        if (!cancelled) setTasks(nextTasks);
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Failed to load tasks.");
        }
      } finally {
        if (!cancelled) setIsLoadingTasks(false);
      }
    }

    void run();
    return () => { cancelled = true; };
  }, [fetchTasks, setError]);

  const selectedTask = useAutoSelect(tasks, selectedTaskId, setSelectedTaskId);
  const groupedTasks = useGroupedItems(tasks, "attributeId", (task) => task.attribute.name);

  const stats = useMemo(() => {
    const activeCount = tasks.filter((t) => t.isActive).length;
    return { visible: tasks.length, active: activeCount, inactive: tasks.length - activeCount };
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

    if (!title) { setFormError("Title is required."); return; }
    if (!formState.attributeId) { setFormError("Attribute is required."); return; }
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

      if (!isEditing) body.taskKind = formState.taskKind;

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
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const payload = await readTaskJson<TaskMutationPayload>(response);

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
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive: !task.isActive }),
      });
      const payload = await readTaskJson<TaskMutationPayload>(response);

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
    if (!deleteTarget) return;

    runMutation(async () => {
      const response = await fetch(`/api/tasks/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const payload = await readTaskJson<DeletePayload>(response);

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

  return {
    tasks,
    attributes,
    groupedTasks,
    selectedTask,
    stats,
    searchInput,
    selectedAttributeId,
    selectedTaskKind,
    includeInactive,
    isMobileDetailOpen,
    isLoadingAttributes,
    isLoadingTasks,
    formMode,
    formState,
    formError,
    deleteTarget,
    errorMessage,
    isPending,
    hasNoAttributes,
    hasNoVisibleTasks,
    hasActiveFilters,
    setSearchInput,
    setSelectedAttributeId,
    setSelectedTaskKind,
    setIncludeInactive,
    setSelectedTaskId,
    setIsMobileDetailOpen,
    setDeleteTarget,
    setFormState,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSaveTask,
    handleToggleActive,
    handleDelete,
  };
}
