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
  CheckCircle2,
  Circle,
  Flame,
  Loader2,
  NotebookPen,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";

import { DetailPanel } from "@/components/app/detail-panel";
import { DetailStat } from "@/components/app/detail-stat";
import { EmptyState } from "@/components/app/empty-state";
import { InteractiveListCard } from "@/components/app/interactive-list-card";
import { MetricCard } from "@/components/app/metric-card";
import { PageIntro } from "@/components/app/page-intro";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

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
    month: "long",
    day: "numeric",
    year: "numeric",
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
      return "Main quest";
    default:
      return value;
  }
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
        throw new Error(payload?.error ?? "Failed to load dashboard.");
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
            error instanceof Error ? error.message : "Failed to load dashboard.",
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
      totalItems: questItems.length,
      completedItems,
      bestStreak,
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
          error instanceof Error ? error.message : "Failed to refresh dashboard.",
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
        setErrorMessage(payload?.error ?? "Failed to update quest completion.");
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

  const handleSaveNote = () => {
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
            note: noteDraft.trim() ? noteDraft.trim() : null,
          }),
        },
      );
      const payload = await readJson<{ error?: string }>(response);

      if (!response.ok) {
        setErrorMessage(payload?.error ?? "Failed to save note.");
        return;
      }

      toast.success(`Saved note for "${selectedQuest.title}".`);
      await loadDashboard();
    });
  };

  const hasNoItems = !isLoading && !questItems.length;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-5 p-6">
            <PageIntro
              eyebrow="Current period"
              title={dashboard ? formatDashboardDate(dashboard.date) : "Loading..."}
              description="Stay on the current period. Complete recurring quests quickly, then use the detail panel to keep a short note when it matters."
              actions={
                <>
                <Button variant="outline" onClick={() => refreshDashboard()} disabled={isPending}>
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
                  Refresh
                </Button>
                <Button asChild>
                  <Link href="/quests">Manage quests</Link>
                </Button>
                </>
              }
            />

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem_auto]">
              <div className="space-y-2">
                <Label htmlFor="dashboard-category-filter">Category</Label>
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
                  <SelectTrigger id="dashboard-category-filter">
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
              </div>

              <div className="flex items-end">
                <label className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-border/90 bg-background/80 px-4 py-3 text-sm shadow-sm">
                  <Checkbox
                    checked={includeInactive}
                    onCheckedChange={(checked) => {
                      const nextValue = checked === true;

                      setIncludeInactive(nextValue);
                      refreshDashboard({ includeInactive: nextValue });
                    }}
                    disabled={isPending}
                  />
                  <span className="font-medium text-foreground">Show inactive quests</span>
                </label>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full lg:w-auto"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setIncludeInactive(false);
                    refreshDashboard({
                      categoryId: null,
                      includeInactive: false,
                    });
                  }}
                  disabled={isPending || (!selectedCategoryId && !includeInactive)}
                >
                  Reset filters
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard
                label="Visible quests"
                value={isLoading ? "..." : stats.totalItems}
              />
              <MetricCard
                label="Completed now"
                value={isLoading ? "..." : stats.completedItems}
              />
              <MetricCard
                label="Best live streak"
                value={isLoading ? "..." : stats.bestStreak}
              />
            </div>
          </CardContent>
        </Card>

        {errorMessage ? (
          <Alert variant="destructive">
            <Circle className="size-4" />
            <AlertTitle>Dashboard update failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="space-y-3 p-6">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hasNoItems ? (
          <EmptyState
            title="No quests in the current view"
            description="Create quests first, or adjust the category and inactive filters to bring items into the current dashboard."
            action={
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/quests">Open quests</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/categories">Manage categories</Link>
                </Button>
              </div>
            }
          />
        ) : (
          <div className="space-y-4">
            {dashboard?.categories.map((category) => (
              <Card key={category.categoryId}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">{category.categoryName}</CardTitle>
                  <CardDescription>
                    {category.items.length} quest{category.items.length === 1 ? "" : "s"} in
                    the active view.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {category.items.map((quest) => (
                    <InteractiveListCard
                      key={quest.questId}
                      selected={selectedQuest?.questId === quest.questId}
                      cardClassName="transition-colors"
                      leading={
                        <button
                          type="button"
                          onClick={() => handleToggleQuest(quest)}
                          disabled={isPending}
                          className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                        >
                          {quest.isCompletedNow ? (
                            <CheckCircle2 className="size-5 text-primary" />
                          ) : (
                            <Circle className="size-5 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {quest.isCompletedNow ? "Uncheck quest" : "Check quest"}
                          </span>
                        </button>
                      }
                      actions={
                        <>
                          <div className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                            <Flame className="size-3.5 text-foreground" />
                            {quest.streak ?? "-"}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedQuestId(quest.questId)}
                          >
                            <NotebookPen className="size-4" />
                            Note
                          </Button>
                        </>
                      }
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedQuestId(quest.questId)}
                        className="min-w-0 text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{quest.title}</p>
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {formatQuestType(quest.questType)}
                          </span>
                          {!quest.isActive ? (
                            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                              Inactive
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {quest.description ?? "No description for this quest yet."}
                        </p>
                        {quest.note ? (
                          <p className="mt-2 text-sm text-foreground/80">
                            Current note: {quest.note}
                          </p>
                        ) : null}
                      </button>
                    </InteractiveListCard>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DetailPanel
        title="Quest detail"
        description="Keep note editing close to the dashboard. Notes are stored on the active period completion, not on the quest definition itself."
      >
          {selectedQuest ? (
            <>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">
                    {selectedQuest.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedQuest.categoryName} · {formatQuestType(selectedQuest.questType)}
                  </p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {selectedQuest.description ?? "No description yet."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <DetailStat
                  label="Current streak"
                  value={
                    <span className="text-2xl font-semibold">
                      {selectedQuest.streak ?? "-"}
                    </span>
                  }
                />
                <DetailStat
                  label="Current period"
                  value={selectedQuest.currentPeriodKey}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dashboard-note">Current period note</Label>
                <Textarea
                  id="dashboard-note"
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  placeholder={
                    selectedQuest.isCompletedNow
                      ? "Add a short note for this completion."
                      : "Complete the quest first to attach a note to this period."
                  }
                  disabled={isPending || !selectedQuest.isCompletedNow}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveNote}
                    disabled={
                      isPending ||
                      !selectedQuest.isCompletedNow ||
                      noteDraft === (selectedQuest.note ?? "")
                    }
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <NotebookPen className="size-4" />}
                    Save note
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setNoteDraft(selectedQuest.note ?? "")}
                    disabled={isPending || noteDraft === (selectedQuest.note ?? "")}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="Select a quest"
              description="Pick any dashboard row to inspect its current streak and edit the note for the active period."
            />
          )}
      </DetailPanel>
    </div>
  );
}
