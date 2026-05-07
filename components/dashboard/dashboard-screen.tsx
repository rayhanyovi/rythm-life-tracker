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
    weekday: "short",
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

function CadenceBadge({ type }: { type: DashboardQuestItem["questType"] }) {
  return (
    <span className="rounded-lg border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.04em] text-muted-foreground">
      {formatQuestType(type)}
    </span>
  );
}

function StreakBadge({ quest }: { quest: DashboardQuestItem }) {
  const streak = quest.streak ?? 0;

  if (quest.questType === "MAIN") {
    return (
      <span className="font-mono text-[10px] font-medium text-muted-foreground">
        Focus
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
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Selected task
        </p>
        <h2 className="text-[15px] font-semibold leading-6 tracking-tight text-foreground">
          {quest.title}
        </h2>
        {quest.description ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {quest.description}
          </p>
        ) : null}
      </div>

      <div className="space-y-4 border-y border-border py-4">
        <DetailRow label="Habit List">
          <span className="inline-flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: getCategoryColor(quest.categoryName) }}
            />
            {quest.categoryName}
          </span>
        </DetailRow>
        <DetailRow label="Cadence">
          <CadenceBadge type={quest.questType} />
        </DetailRow>
        <DetailRow label="Status">{formatQuestSelectionHint(quest)}</DetailRow>
        <DetailRow label="Streak">{formatStreakLabel(quest)}</DetailRow>
        {quest.questType !== "MAIN" ? (
          <DetailRow label="Period">{quest.currentPeriodKey}</DetailRow>
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
            isPending || !canEditNote || noteDraft.trim() === (quest.note ?? "")
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

function QuestRow({
  isPending,
  onOpenMobileDetail,
  onSelect,
  onToggle,
  quest,
  selected,
}: {
  isPending: boolean;
  onOpenMobileDetail: () => void;
  onSelect: () => void;
  onToggle: () => void;
  quest: DashboardQuestItem;
  selected: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-5 py-2.5 transition-colors duration-[160ms] ease-out last:border-b-0",
        selected
          ? "bg-accent"
          : quest.isCompletedNow
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
          quest.isCompletedNow
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-transparent text-muted-foreground hover:border-primary",
        )}
      >
        {quest.isCompletedNow ? (
          <Check className="size-3" />
        ) : (
          <Circle className="size-3.5" />
        )}
        <span className="sr-only">
          {quest.isCompletedNow ? "Uncheck task" : "Check task"}
        </span>
      </button>

      <button type="button" onClick={onSelect} className="min-w-0 text-left">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className={cn(
              "truncate text-[13px] font-medium leading-5",
              quest.isCompletedNow
                ? "text-muted-foreground line-through"
                : "text-foreground",
            )}
          >
            {quest.title}
          </p>
          {!quest.isActive ? (
            <span className="shrink-0 rounded-lg border border-border bg-background px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Inactive
            </span>
          ) : null}
        </div>

        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: getCategoryColor(quest.categoryName) }}
            />
            <span className="truncate">{quest.categoryName}</span>
          </span>
          <CadenceBadge type={quest.questType} />
          {quest.note ? (
            <span className="max-w-[14rem] truncate italic">{quest.note}</span>
          ) : null}
        </div>
      </button>

      <div className="flex items-center gap-2 justify-self-end">
        <StreakBadge quest={quest} />
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
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
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
    [includeInactive, selectedCategoryId],
  );

  const loadCategories = useCallback(async () => {
    const response = await fetch("/api/categories", {
      cache: "no-store",
    });
    const payload = await readJson<CategoriesPayload>(response);

    if (!response.ok || !payload?.categories) {
      throw new Error(payload?.error ?? "Failed to load habit lists.");
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
    return (
      dashboard?.categories.filter((category) => category.items.length > 0) ??
      []
    );
  }, [dashboard]);

  const selectedQuest = useMemo(() => {
    if (!questItems.length) {
      return null;
    }

    return (
      questItems.find((quest) => quest.questId === selectedQuestId) ??
      questItems[0]
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
    const completedItems = questItems.filter(
      (quest) => quest.isCompletedNow,
    ).length;
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
                  <Link href="/quests">
                    <Plus className="size-4" />
                    Add task
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-2 border-t border-border px-5 py-3 md:grid-cols-[minmax(0,1fr)_14rem_auto] md:items-end">
              <div className="space-y-1.5">
                <Label
                  htmlFor="today-category-filter"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  Filter by list
                </Label>
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
                  <SelectTrigger
                    id="today-category-filter"
                    className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                  >
                    <SelectValue placeholder="All lists" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_CATEGORY_VALUE}>
                      All lists
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
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
                  setSelectedCategoryId(null);
                  setIncludeInactive(false);
                  refreshDashboard({
                    categoryId: null,
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
                      <Link href="/quests">Open Lists</Link>
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
              {visibleCategories.map((category) => (
                <section key={category.categoryId}>
                  <SectionLabel
                    label={category.categoryName}
                    count={category.items.length}
                  />
                  <div className="border-t border-border">
                    {category.items.map((quest) => {
                      const selected = selectedQuest?.questId === quest.questId;

                      return (
                        <QuestRow
                          key={quest.questId}
                          quest={quest}
                          selected={selected}
                          isPending={isPending}
                          onToggle={() => handleToggleQuest(quest)}
                          onSelect={() => setSelectedQuestId(quest.questId)}
                          onOpenMobileDetail={() =>
                            openMobileDetail(quest.questId)
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

        <aside className="hidden bg-background xl:block xl:h-screen xl:overflow-y-auto cols-pan-3 border-red-500 border-2">
          <div className="p-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Context pane
            </p>

            <div className="mt-4">
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
