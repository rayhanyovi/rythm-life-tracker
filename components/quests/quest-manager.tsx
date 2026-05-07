"use client";

import Link from "next/link";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
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

type QuestType = "DAILY" | "WEEKLY" | "MONTHLY" | "MAIN";

type CategoryRecord = {
  id: string;
  name: string;
  sortOrder: number;
};

type QuestRecord = {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  questType: QuestType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: CategoryRecord;
};

type QuestsPayload = {
  quests?: QuestRecord[];
  error?: string;
};

type CategoriesPayload = {
  categories?: CategoryRecord[];
  error?: string;
};

type QuestMutationPayload = {
  quest?: QuestRecord;
  error?: string;
};

type DeletePayload = {
  error?: string;
};

type QuestFormState = {
  categoryId: string;
  title: string;
  description: string;
  questType: QuestType;
  isActive: boolean;
};

const QUEST_TYPES: QuestType[] = ["DAILY", "WEEKLY", "MONTHLY", "MAIN"];
const ALL_CATEGORY_VALUE = "__all__";
const ALL_QUEST_TYPE_VALUE = "__all__";

const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  MAIN: "Main",
};

async function readJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function createEmptyFormState(categories: CategoryRecord[]): QuestFormState {
  return {
    categoryId: categories[0]?.id ?? "",
    title: "",
    description: "",
    questType: "DAILY",
    isActive: true,
  };
}

function createFormStateFromQuest(quest: QuestRecord): QuestFormState {
  return {
    categoryId: quest.categoryId,
    title: quest.title,
    description: quest.description ?? "",
    questType: quest.questType,
    isActive: quest.isActive,
  };
}

function formatQuestType(value: QuestType) {
  return QUEST_TYPE_LABELS[value];
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

function CadenceBadge({ type }: { type: QuestType }) {
  return (
    <span className="rounded-lg border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.04em] text-muted-foreground">
      {formatQuestType(type)}
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

function QuestFormFields({
  categories,
  formError,
  formState,
  isPending,
  onChange,
}: {
  categories: CategoryRecord[];
  formError: string | null;
  formState: QuestFormState;
  isPending: boolean;
  onChange: (updater: (current: QuestFormState) => QuestFormState) => void;
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
          placeholder="Optional context for this recurring task."
          disabled={isPending}
          className="min-h-28 resize-none rounded-lg bg-background text-sm shadow-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="list-task-category"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Habit list
        </Label>
        <Select
          value={formState.categoryId}
          onValueChange={(value) =>
            onChange((current) => ({ ...current, categoryId: value }))
          }
          disabled={isPending || categories.length === 0}
        >
          <SelectTrigger
            id="list-task-category"
            className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
          >
            <SelectValue placeholder="Choose a list" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="list-task-type"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Cadence
        </Label>
        <Select
          value={formState.questType}
          onValueChange={(value) =>
            onChange((current) => ({ ...current, questType: value as QuestType }))
          }
          disabled={isPending}
        >
          <SelectTrigger
            id="list-task-type"
            className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
          >
            <SelectValue placeholder="Choose a recurrence" />
          </SelectTrigger>
          <SelectContent>
            {QUEST_TYPES.map((questType) => (
              <SelectItem key={questType} value={questType}>
                {formatQuestType(questType)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

function QuestDetailContent({
  isPending,
  onDelete,
  onEdit,
  onToggleActive,
  quest,
}: {
  isPending: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  quest: QuestRecord;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Selected task
        </p>
        <h2 className="text-[15px] font-semibold leading-6 tracking-tight text-foreground">
          {quest.title}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {quest.description ?? "No description yet."}
        </p>
      </div>

      <div className="space-y-4 border-y border-border py-4">
        <DetailRow label="Habit list">
          <span className="inline-flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: getCategoryColor(quest.category.name) }}
            />
            {quest.category.name}
          </span>
        </DetailRow>
        <DetailRow label="Cadence">
          <CadenceBadge type={quest.questType} />
        </DetailRow>
        <DetailRow label="Status">
          {quest.isActive ? "Active" : "Inactive"}
        </DetailRow>
        <DetailRow label="Created">{formatTimestamp(quest.createdAt)}</DetailRow>
        <DetailRow label="Last updated">{formatTimestamp(quest.updatedAt)}</DetailRow>
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
          {quest.isActive ? "Deactivate" : "Activate"}
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

export function QuestManager() {
  const [quests, setQuests] = useState<QuestRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedQuestType, setSelectedQuestType] = useState<QuestType | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingQuests, setIsLoadingQuests] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [formState, setFormState] = useState<QuestFormState>(
    createEmptyFormState([]),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchCategories = useCallback(async () => {
    const response = await fetch("/api/categories", {
      cache: "no-store",
    });
    const payload = await readJson<CategoriesPayload>(response);

    if (!response.ok || !payload?.categories) {
      throw new Error(payload?.error ?? "Failed to load lists.");
    }

    return payload.categories;
  }, []);

  const fetchQuests = useCallback(
    async (options?: {
      search?: string;
      categoryId?: string | null;
      questType?: QuestType | null;
      includeInactive?: boolean;
    }) => {
      const search = options?.search ?? deferredSearch.trim();
      const categoryId = options?.categoryId ?? selectedCategoryId;
      const questType = options?.questType ?? selectedQuestType;
      const nextIncludeInactive = options?.includeInactive ?? includeInactive;
      const searchParams = new URLSearchParams();

      if (search) searchParams.set("search", search);
      if (categoryId) searchParams.set("categoryId", categoryId);
      if (questType) searchParams.set("questType", questType);
      if (nextIncludeInactive) searchParams.set("includeInactive", "true");

      const query = searchParams.toString();
      const response = await fetch(query ? `/api/quests?${query}` : "/api/quests", {
        cache: "no-store",
      });
      const payload = await readJson<QuestsPayload>(response);

      if (!response.ok || !payload?.quests) {
        throw new Error(payload?.error ?? "Failed to load tasks.");
      }

      return payload.quests;
    },
    [deferredSearch, includeInactive, selectedCategoryId, selectedQuestType],
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const nextCategories = await fetchCategories();

        if (!cancelled) {
          setCategories(nextCategories);
          setFormState((current) => {
            if (current.categoryId || nextCategories.length === 0) {
              return current;
            }

            return { ...current, categoryId: nextCategories[0].id };
          });
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load lists.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCategories(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchCategories]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setErrorMessage(null);

      try {
        const nextQuests = await fetchQuests();

        if (!cancelled) {
          setQuests(nextQuests);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load tasks.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingQuests(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchQuests]);

  const selectedQuest = useMemo(() => {
    if (!quests.length) {
      return null;
    }

    return quests.find((quest) => quest.id === selectedQuestId) ?? quests[0];
  }, [quests, selectedQuestId]);

  useEffect(() => {
    if (!selectedQuest) {
      setSelectedQuestId(null);
      return;
    }

    setSelectedQuestId(selectedQuest.id);
  }, [selectedQuest]);

  const groupedQuests = useMemo(() => {
    const groups = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        items: QuestRecord[];
      }
    >();

    quests.forEach((quest) => {
      const existingGroup = groups.get(quest.categoryId) ?? {
        categoryId: quest.categoryId,
        categoryName: quest.category.name,
        items: [],
      };

      existingGroup.items.push(quest);
      groups.set(quest.categoryId, existingGroup);
    });

    return [...groups.values()];
  }, [quests]);

  const stats = useMemo(() => {
    const activeCount = quests.filter((quest) => quest.isActive).length;

    return {
      visible: quests.length,
      active: activeCount,
      inactive: quests.length - activeCount,
    };
  }, [quests]);

  const hasNoCategories = !isLoadingCategories && categories.length === 0;
  const hasNoVisibleQuests = !isLoadingQuests && !hasNoCategories && quests.length === 0;
  const hasActiveFilters =
    searchInput.trim().length > 0 ||
    selectedCategoryId !== null ||
    selectedQuestType !== null ||
    includeInactive;

  const closeForm = () => {
    setFormMode(null);
    setEditingQuestId(null);
    setFormError(null);
  };

  const refreshQuests = async () => {
    const nextQuests = await fetchQuests();
    setQuests(nextQuests);
  };

  const openCreateForm = () => {
    if (!categories.length) {
      setErrorMessage("Create a list first before adding tasks.");
      return;
    }

    setFormMode("create");
    setEditingQuestId(null);
    setFormError(null);
    setFormState(createEmptyFormState(categories));
  };

  const openEditForm = (quest: QuestRecord) => {
    setFormMode("edit");
    setEditingQuestId(quest.id);
    setFormError(null);
    setFormState(createFormStateFromQuest(quest));
  };

  const handleSaveQuest = () => {
    const title = formState.title.trim();

    if (!title) {
      setFormError("Title is required.");
      return;
    }

    if (!formState.categoryId) {
      setFormError("List is required.");
      return;
    }

    setErrorMessage(null);
    setFormError(null);

    startTransition(async () => {
      const isEditing = formMode === "edit" && editingQuestId;
      const response = await fetch(
        isEditing ? `/api/quests/${editingQuestId}` : "/api/quests",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            categoryId: formState.categoryId,
            title,
            description: formState.description,
            questType: formState.questType,
            isActive: formState.isActive,
          }),
        },
      );
      const payload = await readJson<QuestMutationPayload>(response);

      if (!response.ok || !payload?.quest) {
        setFormError(payload?.error ?? "Failed to save task.");
        return;
      }

      toast.success(isEditing ? `Updated "${title}".` : `Created "${title}".`);
      closeForm();
      setSelectedQuestId(payload.quest.id);
      await refreshQuests();
    });
  };

  const handleToggleActive = (quest: QuestRecord) => {
    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/quests/${quest.id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          isActive: !quest.isActive,
        }),
      });
      const payload = await readJson<QuestMutationPayload>(response);

      if (!response.ok || !payload?.quest) {
        setErrorMessage(payload?.error ?? "Failed to update task status.");
        return;
      }

      toast.success(
        payload.quest.isActive
          ? `Reactivated "${payload.quest.title}".`
          : `Deactivated "${payload.quest.title}".`,
      );

      if (editingQuestId === quest.id) {
        setFormState(createFormStateFromQuest(payload.quest));
      }

      await refreshQuests();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/quests/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const payload = await readJson<DeletePayload>(response);

      if (!response.ok && response.status !== 204) {
        setErrorMessage(payload?.error ?? "Failed to delete task.");
        return;
      }

      toast.success(`Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);

      if (selectedQuestId === deleteTarget.id) {
        setSelectedQuestId(null);
      }

      await refreshQuests();
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
                  {isLoadingQuests
                    ? "loading task library"
                    : `${stats.visible} visible | ${stats.active} active | ${stats.inactive} inactive`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={openCreateForm}
                  disabled={isPending || hasNoCategories}
                >
                  <Plus className="size-4" />
                  Add task
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/categories">Open Habit Lists</Link>
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
                value={selectedCategoryId ?? ALL_CATEGORY_VALUE}
                onValueChange={(value) =>
                  setSelectedCategoryId(value === ALL_CATEGORY_VALUE ? null : value)
                }
                disabled={isPending || isLoadingCategories}
              >
                <SelectTrigger
                  aria-label="Filter tasks by list"
                  className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                >
                  <SelectValue placeholder="All lists" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORY_VALUE}>All lists</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedQuestType ?? ALL_QUEST_TYPE_VALUE}
                onValueChange={(value) =>
                  setSelectedQuestType(
                    value === ALL_QUEST_TYPE_VALUE ? null : (value as QuestType),
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
                  <SelectItem value={ALL_QUEST_TYPE_VALUE}>All types</SelectItem>
                  {QUEST_TYPES.map((questType) => (
                    <SelectItem key={questType} value={questType}>
                      {formatQuestType(questType)}
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
                  setSelectedCategoryId(null);
                  setSelectedQuestType(null);
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

          {isLoadingCategories || isLoadingQuests ? (
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
          ) : hasNoCategories ? (
            <div className="p-5">
              <EmptyState
                title="Create lists before tasks"
                description="Tasks always belong to a list container. Set up at least one habit list first, then come back here to build the recurring library."
                action={
                  <Button asChild>
                    <Link href="/categories">Manage Habit Lists</Link>
                  </Button>
                }
              />
            </div>
          ) : hasNoVisibleQuests ? (
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
                      <Link href="/categories">Open Habit Lists</Link>
                    </Button>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="pb-5">
              {groupedQuests.map((group) => (
                <section key={group.categoryId}>
                  <SectionLabel
                    label={group.categoryName}
                    count={group.items.length}
                  />
                  <div className="border-t border-border">
                    {group.items.map((quest) => {
                      const selected = selectedQuest?.id === quest.id;

                      return (
                        <div
                          key={quest.id}
                          className={cn(
                            "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-5 py-2.5 transition-colors duration-[160ms] ease-out last:border-b-0",
                            selected ? "bg-accent" : "bg-card hover:bg-muted/35",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedQuestId(quest.id)}
                            className="min-w-0 text-left"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-[13px] font-medium leading-5 text-foreground">
                                {quest.title}
                              </p>
                              <CadenceBadge type={quest.questType} />
                              {!quest.isActive ? (
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
                                      quest.category.name,
                                    ),
                                  }}
                                />
                                <span className="truncate">{quest.category.name}</span>
                              </span>
                              <span className="font-mono text-[10px]">
                                Updated {formatTimestamp(quest.updatedAt)}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs leading-5 text-muted-foreground">
                              {quest.description ?? "No description yet."}
                            </p>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant={selected ? "secondary" : "outline"}
                              className="hidden h-8 px-2 text-xs xl:inline-flex"
                              onClick={() => setSelectedQuestId(quest.id)}
                            >
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs xl:hidden"
                              onClick={() => {
                                setSelectedQuestId(quest.id);
                                setIsMobileDetailOpen(true);
                              }}
                            >
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs"
                              onClick={() => openEditForm(quest)}
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
              {selectedQuest ? (
                <QuestDetailContent
                  quest={selectedQuest}
                  onEdit={() => openEditForm(selectedQuest)}
                  onToggleActive={() => handleToggleActive(selectedQuest)}
                  onDelete={() => setDeleteTarget(selectedQuest)}
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
              Keep the editor lightweight. Every task belongs to one list and uses a
              single cadence.
            </SheetDescription>
          </SheetHeader>

          <div className="overflow-y-auto pr-1">
            <QuestFormFields
              categories={categories}
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
            <Button onClick={handleSaveQuest} disabled={isPending || hasNoCategories}>
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

          {selectedQuest ? (
            <div className="mt-5">
              <QuestDetailContent
                quest={selectedQuest}
                onEdit={() => {
                  setIsMobileDetailOpen(false);
                  openEditForm(selectedQuest);
                }}
                onToggleActive={() => handleToggleActive(selectedQuest)}
                onDelete={() => setDeleteTarget(selectedQuest)}
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
