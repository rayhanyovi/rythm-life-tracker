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
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { DetailPanel } from "@/components/app/detail-panel";
import { DetailStat } from "@/components/app/detail-stat";
import { EmptyState } from "@/components/app/empty-state";
import { InteractiveListCard } from "@/components/app/interactive-list-card";
import { MetricCard } from "@/components/app/metric-card";
import { PageIntro } from "@/components/app/page-intro";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  MAIN: "Main quest",
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

export function QuestManager() {
  const [quests, setQuests] = useState<QuestRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedQuestType, setSelectedQuestType] =
    useState<QuestType | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
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
      throw new Error(payload?.error ?? "Failed to load categories.");
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
      const nextIncludeInactive =
        options?.includeInactive ?? includeInactive;
      const searchParams = new URLSearchParams();

      if (search) {
        searchParams.set("search", search);
      }

      if (categoryId) {
        searchParams.set("categoryId", categoryId);
      }

      if (questType) {
        searchParams.set("questType", questType);
      }

      if (nextIncludeInactive) {
        searchParams.set("includeInactive", "true");
      }

      const query = searchParams.toString();
      const response = await fetch(
        query ? `/api/quests?${query}` : "/api/quests",
        {
          cache: "no-store",
        },
      );
      const payload = await readJson<QuestsPayload>(response);

      if (!response.ok || !payload?.quests) {
        throw new Error(payload?.error ?? "Failed to load quests.");
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

            return {
              ...current,
              categoryId: nextCategories[0].id,
            };
          });
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load categories.",
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
            error instanceof Error ? error.message : "Failed to load quests.",
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

  const stats = useMemo(() => {
    const activeCount = quests.filter((quest) => quest.isActive).length;

    return {
      visible: quests.length,
      active: activeCount,
      inactive: quests.length - activeCount,
    };
  }, [quests]);

  const hasNoCategories = !isLoadingCategories && categories.length === 0;
  const hasNoVisibleQuests =
    !isLoadingQuests && !hasNoCategories && quests.length === 0;
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
      setErrorMessage("Create a category first before adding quests.");
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
      setFormError("Category is required.");
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
        setFormError(payload?.error ?? "Failed to save quest.");
        return;
      }

      toast.success(
        isEditing ? `Updated "${title}".` : `Created "${title}".`,
      );
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
        setErrorMessage(payload?.error ?? "Failed to update quest status.");
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
        setErrorMessage(payload?.error ?? "Failed to delete quest.");
        return;
      }

      setDeleteTarget(null);
      toast.success(`Deleted "${deleteTarget.title}".`);

      if (selectedQuestId === deleteTarget.id) {
        setSelectedQuestId(null);
      }

      await refreshQuests();
    });
  };

  const topActions = (
    <>
      <Button onClick={openCreateForm} disabled={isPending || hasNoCategories}>
        <Plus className="size-4" />
        Add quest
      </Button>
    </>
  );

  return (
    <>
      <Card>
        <CardContent className="space-y-6 p-6">
          <PageIntro
            eyebrow="Management view"
            title="Keep the quest library clean"
            description="Search by title or description, keep inactive items optional, and use a dedicated form sheet for create and edit flows."
            actions={topActions}
          />

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem_14rem]">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search quests by title or description"
                className="pl-11"
              />
            </div>
            <Select
              value={selectedCategoryId ?? ALL_CATEGORY_VALUE}
              onValueChange={(value) =>
                setSelectedCategoryId(
                  value === ALL_CATEGORY_VALUE ? null : value,
                )
              }
              disabled={isPending || isLoadingCategories}
            >
              <SelectTrigger aria-label="Filter quests by category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORY_VALUE}>All categories</SelectItem>
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
              <SelectTrigger aria-label="Filter quests by recurrence type">
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

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-border/90 bg-background/80 px-4 py-3 text-sm shadow-sm">
              <Checkbox
                checked={includeInactive}
                onCheckedChange={(checked) => setIncludeInactive(checked === true)}
                disabled={isPending}
              />
              <span className="font-medium text-foreground">Show inactive quests</span>
            </label>
            <Button
              variant="outline"
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

          <div className="grid gap-3 md:grid-cols-3">
            <MetricCard
              label="Visible quests"
              value={isLoadingQuests ? "..." : stats.visible}
            />
            <MetricCard
              label="Active now"
              value={isLoadingQuests ? "..." : stats.active}
            />
            <MetricCard
              label="Inactive visible"
              value={isLoadingQuests ? "..." : stats.inactive}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          {errorMessage ? (
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertTitle>Quest update failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {isLoadingCategories || isLoadingQuests ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="space-y-3 p-6">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-14 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hasNoCategories ? (
            <EmptyState
              title="Create categories before quests"
              description="Quests always belong to a life area. Set up at least one category first, then come back here to build the recurring list."
              action={
                <Button asChild>
                  <Link href="/categories">Manage categories</Link>
                </Button>
              }
            />
          ) : hasNoVisibleQuests ? (
            <EmptyState
              title="No quests match the current view"
              description="Add your first quest or relax the filters if the current management view is too narrow."
              action={
                <div className="flex flex-wrap gap-3">
                  <Button onClick={openCreateForm}>
                    <Plus className="size-4" />
                    Add quest
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/categories">Manage categories</Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="space-y-4">
              {quests.map((quest) => (
                <InteractiveListCard
                  key={quest.id}
                  selected={selectedQuest?.id === quest.id}
                  actions={
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditForm(quest)}
                        disabled={isPending}
                      >
                        <PencilLine className="size-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(quest)}
                        disabled={isPending}
                      >
                        {quest.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(quest)}
                        disabled={isPending}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </>
                  }
                >
                  <button
                    type="button"
                    onClick={() => setSelectedQuestId(quest.id)}
                    className="min-w-0 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{quest.title}</p>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {formatQuestType(quest.questType)}
                      </span>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                        {quest.category.name}
                      </span>
                      {!quest.isActive ? (
                        <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {quest.description ?? "No description for this quest yet."}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Updated {formatTimestamp(quest.updatedAt)}
                    </p>
                  </button>
                </InteractiveListCard>
              ))}
            </div>
          )}
        </div>

        <DetailPanel
          title="Quest detail"
          description="Use this side panel to review a quest quickly before editing, deactivating, or hard deleting it."
        >
            {selectedQuest ? (
              <>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-foreground">
                      {selectedQuest.title}
                    </p>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {formatQuestType(selectedQuest.questType)}
                    </span>
                    {!selectedQuest.isActive ? (
                      <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                        Inactive
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedQuest.category.name}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {selectedQuest.description ?? "No description yet."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <DetailStat
                    label="Created"
                    value={formatTimestamp(selectedQuest.createdAt)}
                  />
                  <DetailStat
                    label="Last updated"
                    value={formatTimestamp(selectedQuest.updatedAt)}
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => openEditForm(selectedQuest)}
                    disabled={isPending}
                  >
                    <PencilLine className="size-4" />
                    Edit quest
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleToggleActive(selectedQuest)}
                    disabled={isPending}
                  >
                    {selectedQuest.isActive ? "Deactivate quest" : "Activate quest"}
                  </Button>
                  <Button
                    className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    variant="ghost"
                    onClick={() => setDeleteTarget(selectedQuest)}
                    disabled={isPending}
                  >
                    <Trash2 className="size-4" />
                    Delete quest
                  </Button>
                </div>

                <Alert>
                  <Sparkles className="size-4" />
                  <AlertTitle>Deletion is permanent</AlertTitle>
                  <AlertDescription>
                    Hard delete removes the quest and its completion history from
                    the database because completions cascade with the quest.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <EmptyState
                title="Select a quest"
                description="Choose any row to review its metadata and access quick management actions."
              />
            )}
        </DetailPanel>
      </div>

      <Sheet
        open={Boolean(formMode)}
        onOpenChange={(open) => !open && closeForm()}
      >
        <SheetContent className="w-[92vw] max-w-xl gap-6">
          <SheetHeader>
            <SheetTitle>
              {formMode === "edit" ? "Edit quest" : "Create quest"}
            </SheetTitle>
            <SheetDescription>
              Keep the form lightweight. Every quest belongs to a category and
              uses a single recurrence type.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 overflow-y-auto pr-1">
            {formError ? (
              <Alert variant="destructive">
                <CircleAlert className="size-4" />
                <AlertTitle>Could not save quest</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="quest-title">Title</Label>
              <Input
                id="quest-title"
                value={formState.title}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Morning prayer, Deep work block, Read 10 pages"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quest-description">Description</Label>
              <Textarea
                id="quest-description"
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Optional context to clarify the ritual or desired outcome."
                disabled={isPending}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="quest-category">Category</Label>
              <Select
                value={formState.categoryId}
                onValueChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    categoryId: value,
                  }))
                }
                disabled={isPending || categories.length === 0}
              >
                <SelectTrigger id="quest-category">
                  <SelectValue placeholder="Choose a category" />
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

            <div className="space-y-3">
              <Label htmlFor="quest-type">Quest type</Label>
              <Select
                value={formState.questType}
                onValueChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    questType: value as QuestType,
                  }))
                }
                disabled={isPending}
              >
                <SelectTrigger id="quest-type">
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

            <div className="space-y-3">
              <Label htmlFor="quest-active">Status</Label>
              <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-border/90 bg-background/80 px-4 py-3 text-sm shadow-sm">
                <Checkbox
                  id="quest-active"
                  checked={formState.isActive}
                  onCheckedChange={(checked) =>
                    setFormState((current) => ({
                      ...current,
                      isActive: checked === true,
                    }))
                  }
                  disabled={isPending}
                />
                <span className="font-medium text-foreground">Quest is active</span>
              </label>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={closeForm} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveQuest}
              disabled={isPending || hasNoCategories}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : formMode === "edit" ? (
                <PencilLine className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {formMode === "edit" ? "Save changes" : "Create quest"}
            </Button>
          </SheetFooter>
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
            <AlertDialogTitle>Delete quest</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteTarget?.title}&quot; only if you accept losing the
              linked completion history as well. This action cannot be undone.
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
