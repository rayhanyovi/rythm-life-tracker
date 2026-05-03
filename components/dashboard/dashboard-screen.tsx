"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  CheckCircle2,
  Circle,
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
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  sortOrder: number;
};

type DashboardQuestItem = {
  categoryId: string;
  categoryName: string;
  completionId: string | null;
  currentPeriodKey: string;
  description: string | null;
  isActive: boolean;
  isCompletedNow: boolean;
  note: string | null;
  questId: string;
  questType: "DAILY" | "WEEKLY" | "MONTHLY" | "MAIN";
  streak: number | null;
  title: string;
};

type DashboardPayload = {
  date: string;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    items: DashboardQuestItem[];
  }>;
  error?: string;
};

type CategoriesPayload = {
  categories?: CategoryOption[];
  error?: string;
};

type QuestDetailContentProps = {
  isPending: boolean;
  noteDraft: string;
  onChangeNote: (value: string) => void;
  onClearNote: () => void;
  onSaveNote: () => void;
  quest: DashboardQuestItem;
};

const ALL_CATEGORY_VALUE = "__all__";

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
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatQuestType(value: DashboardQuestItem["questType"]) {
  switch (value) {
    case "DAILY":
      return "Daily";
    case "WEEKLY":
      return "Weekly";
    case "MONTHLY":
      return "Monthly";
    case "MAIN":
      return "Main";
    default:
      return value;
  }
}

function formatStreakLabel(quest: DashboardQuestItem) {
  const streak = quest.streak ?? 0;

  if (quest.questType === "MAIN") {
    return streak > 0 ? `${streak} period streak` : "Primary focus";
  }

  if (!streak) {
    return `${formatQuestType(quest.questType)} cadence`;
  }

  const unit =
    quest.questType === "DAILY"
      ? "day"
      : quest.questType === "WEEKLY"
        ? "week"
        : "month";

  return `${streak} ${unit} streak`;
}

function formatQuestSelectionHint(quest: DashboardQuestItem) {
  return quest.isCompletedNow
    ? "Completed in the active period"
    : "Open in the active period";
}

function DetailStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-background/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function StatusCell({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-card px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function QuestDetailContent({
  isPending,
  noteDraft,
  onChangeNote,
  onClearNote,
  onSaveNote,
  quest,
}: QuestDetailContentProps) {
  const canEditNote = quest.isCompletedNow;
  const hasNoteDraft = noteDraft.trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Selected task
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {quest.title}
          </h2>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {quest.categoryName} | {formatQuestType(quest.questType)}
        </p>
        {quest.description ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {quest.description}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3">
        <DetailStat label="Status" value={formatQuestSelectionHint(quest)} />
        <DetailStat label="Streak" value={formatStreakLabel(quest)} />
        <DetailStat label="Period key" value={quest.currentPeriodKey} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="today-note">Current period note</Label>
        <Textarea
          id="today-note"
          value={noteDraft}
          onChange={(event) => onChangeNote(event.target.value)}
          placeholder={
            canEditNote
              ? "Add a short note for this completion."
              : "Complete the task first to attach a note to this period."
          }
          disabled={isPending || !canEditNote}
          className="min-h-32"
        />
        <p className="text-xs leading-5 text-muted-foreground">
          Notes stay attached to the current completion, not to the task definition.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onSaveNote}
          disabled={
            isPending ||
            !canEditNote ||
            noteDraft.trim() === (quest.note ?? "")
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
          variant="outline"
          onClick={onClearNote}
          disabled={isPending || !canEditNote || !hasNoteDraft}
        >
          Clear note
        </Button>
      </div>
    </div>
  );
}

export function DashboardScreen() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadDashboard = useCallback(
    async (options?: {
      categoryId?: string | null;
      includeInactive?: boolean;
    }) => {
      const categoryId = options?.categoryId ?? selectedCategoryId;
      const nextIncludeInactive = options?.includeInactive ?? includeInactive;
      const searchParams = new URLSearchParams();

      if (categoryId) {
        searchParams.set("categoryId", categoryId);
      }

      if (nextIncludeInactive) {
        searchParams.set("includeInactive", "true");
      }

      const response = await fetch(`/api/dashboard?${searchParams.toString()}`, {
        cache: "no-store",
      });
      const payload = await readJson<DashboardPayload>(response);

      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? "Failed to load today.");
      }

      setDashboard(payload);
    },
    [includeInactive, selectedCategoryId],
  );

  const loadCategories = useCallback(async () => {
    const response = await fetch("/api/categories", {
      cache: "no-store",
    });
    const payload = await readJson<CategoriesPayload>(response);

    if (!response.ok || !payload?.categories) {
      throw new Error(payload?.error ?? "Failed to load categories.");
    }

    setCategories(payload.categories);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await Promise.all([loadDashboard(), loadCategories()]);
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
  }, [loadCategories, loadDashboard]);

  const questItems = useMemo(() => {
    return dashboard?.categories.flatMap((category) => category.items) ?? [];
  }, [dashboard]);

  const visibleCategories = useMemo(() => {
    return dashboard?.categories.filter((category) => category.items.length > 0) ?? [];
  }, [dashboard]);

  const selectedQuest = useMemo(() => {
    if (!questItems.length) {
      return null;
    }

    return (
      questItems.find((quest) => quest.questId === selectedQuestId) ?? questItems[0]
    );
  }, [questItems, selectedQuestId]);

  useEffect(() => {
    if (!selectedQuest) {
      setNoteDraft("");
      return;
    }

    setSelectedQuestId(selectedQuest.questId);
    setNoteDraft(selectedQuest.note ?? "");
  }, [selectedQuest]);

  const stats = useMemo(() => {
    const completedItems = questItems.filter((quest) => quest.isCompletedNow).length;
    const bestStreak = questItems.reduce((best, quest) => {
      return Math.max(best, quest.streak ?? 0);
    }, 0);

    return {
      bestStreak,
      completedItems,
      totalItems: questItems.length,
    };
  }, [questItems]);

  const refreshDashboard = (nextState?: {
    categoryId?: string | null;
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

  const handleToggleQuest = (quest: DashboardQuestItem) => {
    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch(
        `/api/quests/${quest.questId}/current-completion`,
        {
          method: quest.isCompletedNow ? "DELETE" : "PUT",
          headers: {
            "content-type": "application/json",
          },
          body: quest.isCompletedNow ? undefined : JSON.stringify({}),
        },
      );
      const payload = await readJson<{ error?: string }>(response);

      if (!response.ok && response.status !== 204) {
        setErrorMessage(payload?.error ?? "Failed to update task completion.");
        return;
      }

      toast.success(
        quest.isCompletedNow
          ? `Unchecked "${quest.title}" for the active period.`
          : `Completed "${quest.title}" for the active period.`,
      );
      await loadDashboard();
    });
  };

  const persistNote = (nextNote: string | null) => {
    if (!selectedQuest?.completionId) {
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch(
        `/api/completions/${selectedQuest.completionId}`,
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
          ? `Saved note for "${selectedQuest.title}".`
          : `Cleared note for "${selectedQuest.title}".`,
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

  const openMobileDetail = (questId: string) => {
    setSelectedQuestId(questId);
    setIsMobileDetailOpen(true);
  };

  const hasNoItems = !isLoading && !questItems.length;
  const canResetFilters = Boolean(selectedCategoryId || includeInactive);
  const currentDateLabel = dashboard ? formatDashboardDate(dashboard.date) : "Loading today";

  return (
    <>
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-[1.25rem] border border-border/80 bg-card/92 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Tasks / Today
                </p>
                <div className="space-y-1">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Today
                  </h1>
                  <p className="text-base text-foreground/90">{currentDateLabel}</p>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Due work and recurring rhythm live in one list. Check, inspect, or
                  correct without leaving the flow.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
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
                <Button asChild>
                  <Link href="/quests">
                    <Plus className="size-4" />
                    Add task
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.9fr)]">
              <Button
                asChild
                variant="outline"
                className="h-auto justify-between rounded-xl border-border/80 px-4 py-3 text-left"
              >
                <Link href="/quests">
                  <span className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Plus className="size-4" />
                    Add task to Today
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    Opens Lists
                  </span>
                </Link>
              </Button>

              <div className="rounded-xl border border-border/80 bg-background/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Current rhythm
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  Daily checklist first. Notes stay contextual.
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
              <StatusCell
                label="Visible tasks"
                value={isLoading ? "..." : stats.totalItems}
              />
              <StatusCell
                label="Completed now"
                value={isLoading ? "..." : stats.completedItems}
              />
              <StatusCell
                label="Best streak"
                value={isLoading ? "..." : stats.bestStreak}
              />
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_15rem_auto] xl:items-end">
              <div className="space-y-2">
                <Label htmlFor="today-category-filter">Filter by list</Label>
                <Select
                  value={selectedCategoryId ?? ALL_CATEGORY_VALUE}
                  onValueChange={(value) => {
                    const nextCategoryId =
                      value === ALL_CATEGORY_VALUE ? null : value;

                    setSelectedCategoryId(nextCategoryId);
                    refreshDashboard({ categoryId: nextCategoryId });
                  }}
                  disabled={isPending || isLoading}
                >
                  <SelectTrigger id="today-category-filter">
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
              </div>

              <div className="space-y-2">
                <Label>Inactive</Label>
                <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border/80 bg-background/80 px-4 py-3 text-sm shadow-xs">
                  <Checkbox
                    checked={includeInactive}
                    onCheckedChange={(checked) => {
                      const nextValue = checked === true;

                      setIncludeInactive(nextValue);
                      refreshDashboard({ includeInactive: nextValue });
                    }}
                    disabled={isPending}
                  />
                  <span className="font-medium text-foreground">
                    Show inactive
                  </span>
                </label>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategoryId(null);
                  setIncludeInactive(false);
                  refreshDashboard({
                    categoryId: null,
                    includeInactive: false,
                  });
                }}
                disabled={isPending || !canResetFilters}
                className="justify-self-start xl:justify-self-end"
              >
                Reset filters
              </Button>
            </div>
          </section>

          {errorMessage ? (
            <Alert variant="destructive">
              <Circle className="size-4" />
              <AlertTitle>Today update failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <section
                  key={index}
                  className="overflow-hidden rounded-[1.15rem] border border-border/80 bg-card/95 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                  <div>
                    {Array.from({ length: 3 }).map((__, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="grid gap-3 border-b border-border/70 px-4 py-3.5 last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                      >
                        <Skeleton className="size-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-44" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-20 rounded-md" />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : hasNoItems ? (
            <EmptyState
              title="No tasks in this view"
              description="Today is empty right now. Add a task or broaden the filters to bring more work into the current surface."
              action={
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/quests">Open Lists</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/categories">Open Habit Lists</Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="space-y-4">
              {visibleCategories.map((category) => (
                <section
                  key={category.categoryId}
                  className="overflow-hidden rounded-[1.15rem] border border-border/80 bg-card/95 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/30 px-4 py-3.5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {category.categoryName}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {category.items.length} task
                      {category.items.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div>
                    {category.items.map((quest) => {
                      const selected = selectedQuest?.questId === quest.questId;

                      return (
                        <div
                          key={quest.questId}
                          className={cn(
                            "grid gap-3 border-b border-border/70 px-4 py-3.5 last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]",
                            selected && "bg-accent/30",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleQuest(quest)}
                            disabled={isPending}
                            className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-[background-color,border-color,color] duration-[160ms] ease-out hover:bg-muted disabled:opacity-50"
                          >
                            {quest.isCompletedNow ? (
                              <CheckCircle2 className="size-4 text-primary" />
                            ) : (
                              <Circle className="size-4 text-muted-foreground" />
                            )}
                            <span className="sr-only">
                              {quest.isCompletedNow ? "Uncheck task" : "Check task"}
                            </span>
                          </button>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setSelectedQuestId(quest.questId)}
                              className="block w-full text-left"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {quest.title}
                                </p>
                                {!quest.isActive ? (
                                  <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    Inactive
                                  </span>
                                ) : null}
                              </div>
                            </button>

                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                              <span>{formatQuestType(quest.questType)}</span>
                              <span className="size-1 rounded-full bg-border" />
                              <span>{formatStreakLabel(quest)}</span>
                              {quest.isCompletedNow ? (
                                <>
                                  <span className="size-1 rounded-full bg-border" />
                                  <span>Completed now</span>
                                </>
                              ) : null}
                            </div>

                            {quest.note ? (
                              <p className="mt-2 truncate text-xs leading-5 text-muted-foreground">
                                Note: {quest.note}
                              </p>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2 sm:justify-self-end">
                            <Button
                              size="sm"
                              variant={selected ? "secondary" : "outline"}
                              className="hidden h-8 px-3 xl:inline-flex"
                              onClick={() => setSelectedQuestId(quest.questId)}
                            >
                              <NotebookPen className="size-4" />
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 xl:hidden"
                              onClick={() => openMobileDetail(quest.questId)}
                            >
                              <NotebookPen className="size-4" />
                              Detail
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

        <aside className="hidden 2xl:block">
          <div className="sticky top-4 rounded-[1.25rem] border border-border/80 bg-card/95 p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Context pane
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Keep inspection, note editing, and correction close to the checklist.
            </p>

            <div className="mt-5">
              {selectedQuest ? (
                <QuestDetailContent
                  quest={selectedQuest}
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

          {selectedQuest ? (
            <div className="mt-5">
              <QuestDetailContent
                quest={selectedQuest}
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
