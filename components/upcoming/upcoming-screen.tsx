"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  CalendarClock,
  CircleAlert,
  ExternalLink,
  Loader2,
  NotebookPen,
  RefreshCw,
} from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

type QuestType = "DAILY" | "WEEKLY" | "MONTHLY";

type CategoryOption = {
  id: string;
  name: string;
  sortOrder: number;
};

type UpcomingItem = {
  categoryId: string;
  categoryName: string;
  completionId: string | null;
  description: string | null;
  isCompleted: boolean;
  note: string | null;
  periodKey: string;
  questId: string;
  questType: QuestType;
  title: string;
};

type UpcomingPayload = {
  endDate?: string;
  error?: string;
  groups?: Array<{
    date: string;
    items: UpcomingItem[];
  }>;
  horizonDays?: number;
  startDate?: string;
};

type CategoriesPayload = {
  categories?: CategoryOption[];
  error?: string;
};

const ALL_CATEGORY_VALUE = "__all__";
const ALL_QUEST_TYPE_VALUE = "__all__";
const HORIZON_OPTIONS = [7, 14, 30] as const;
const QUEST_TYPES: QuestType[] = ["DAILY", "WEEKLY", "MONTHLY"];

const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  DAILY: "Daily",
  MONTHLY: "Monthly",
  WEEKLY: "Weekly",
};

async function readJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatDateShort(value?: string) {
  if (!value) {
    return "...";
  }

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatQuestType(value: QuestType) {
  return QUEST_TYPE_LABELS[value];
}

function UpcomingDetail({ item }: { item: UpcomingItem }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Planned period
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {item.title}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{item.categoryName}</span>
          <span className="size-1 rounded-full bg-border" />
          <span>{formatQuestType(item.questType)}</span>
          <span className="size-1 rounded-full bg-border" />
          <span>{item.periodKey}</span>
        </div>
        {item.description ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3">
        <div className="rounded-xl border border-border/80 bg-background/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Status
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {item.isCompleted ? "Already completed" : "Not completed yet"}
          </p>
        </div>
        <div className="rounded-xl border border-border/80 bg-background/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Completion note
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {item.note ?? "No completion note for this period."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard">
            <CalendarClock className="size-4" />
            Open Today
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/quests">
            <ExternalLink className="size-4" />
            Manage task
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function UpcomingScreen() {
  const [payload, setPayload] = useState<UpcomingPayload | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [questType, setQuestType] = useState<QuestType | null>(null);
  const [horizon, setHorizon] = useState<(typeof HORIZON_OPTIONS)[number]>(7);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchUpcoming = useCallback(
    async (options?: {
      categoryId?: string | null;
      horizon?: number;
      questType?: QuestType | null;
    }) => {
      const nextCategoryId = options?.categoryId ?? categoryId;
      const nextHorizon = options?.horizon ?? horizon;
      const nextQuestType = options?.questType ?? questType;
      const searchParams = new URLSearchParams({
        horizon: String(nextHorizon),
      });

      if (nextCategoryId) {
        searchParams.set("categoryId", nextCategoryId);
      }

      if (nextQuestType) {
        searchParams.set("questType", nextQuestType);
      }

      const response = await fetch(`/api/upcoming?${searchParams.toString()}`, {
        cache: "no-store",
      });
      const nextPayload = await readJson<UpcomingPayload>(response);

      if (!response.ok || !nextPayload?.groups) {
        throw new Error(nextPayload?.error ?? "Failed to load upcoming work.");
      }

      setPayload(nextPayload);
    },
    [categoryId, horizon, questType],
  );

  const fetchCategories = useCallback(async () => {
    const response = await fetch("/api/categories", {
      cache: "no-store",
    });
    const nextPayload = await readJson<CategoriesPayload>(response);

    if (!response.ok || !nextPayload?.categories) {
      throw new Error(nextPayload?.error ?? "Failed to load habit lists.");
    }

    setCategories(nextPayload.categories);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await Promise.all([fetchUpcoming(), fetchCategories()]);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to load upcoming work.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingCategories(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchCategories, fetchUpcoming]);

  const items = useMemo(() => {
    return payload?.groups?.flatMap((group) => group.items) ?? [];
  }, [payload]);

  const selectedItem = useMemo(() => {
    if (!items.length) {
      return null;
    }

    return (
      items.find((item) => `${item.questId}:${item.periodKey}` === selectedKey) ??
      items[0]
    );
  }, [items, selectedKey]);

  useEffect(() => {
    if (!selectedItem) {
      setSelectedKey(null);
      return;
    }

    setSelectedKey(`${selectedItem.questId}:${selectedItem.periodKey}`);
  }, [selectedItem]);

  const stats = useMemo(() => {
    const completedCount = items.filter((item) => item.isCompleted).length;
    const dateCount = payload?.groups?.length ?? 0;

    return {
      completedCount,
      dateCount,
      totalCount: items.length,
    };
  }, [items, payload]);

  const refreshUpcoming = (options?: {
    categoryId?: string | null;
    horizon?: number;
    questType?: QuestType | null;
  }) => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await fetchUpcoming(options);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to refresh upcoming work.",
        );
      }
    });
  };

  const canResetFilters = Boolean(categoryId || questType || horizon !== 7);
  const hasNoItems = !isLoading && items.length === 0;

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-5">
          <section className="border-b border-border/70 pb-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Tasks / Upcoming
                </p>
                <div className="space-y-1">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Upcoming
                  </h1>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {formatDateShort(payload?.startDate)} to{" "}
                    {formatDateShort(payload?.endDate)}
                  </p>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  Scan the next recurring periods by date, then open the task where
                  the current model can act on it.
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {isLoading
                    ? "Loading upcoming work"
                    : `${stats.totalCount} tasks across ${stats.dateCount} dates | ${stats.completedCount} already complete`}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => refreshUpcoming()}
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
                    <ExternalLink className="size-4" />
                    Add task
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-[12rem_minmax(0,1fr)_13rem_auto] xl:items-end">
              <div className="space-y-2">
                <Label htmlFor="upcoming-horizon">Horizon</Label>
                <Select
                  value={String(horizon)}
                  onValueChange={(value) => {
                    const nextHorizon = Number(value) as typeof horizon;

                    setHorizon(nextHorizon);
                    refreshUpcoming({ horizon: nextHorizon });
                  }}
                  disabled={isPending || isLoading}
                >
                  <SelectTrigger id="upcoming-horizon">
                    <SelectValue placeholder="7 days" />
                  </SelectTrigger>
                  <SelectContent>
                    {HORIZON_OPTIONS.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option} days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upcoming-category">Habit list</Label>
                <Select
                  value={categoryId ?? ALL_CATEGORY_VALUE}
                  onValueChange={(value) => {
                    const nextCategoryId =
                      value === ALL_CATEGORY_VALUE ? null : value;

                    setCategoryId(nextCategoryId);
                    refreshUpcoming({ categoryId: nextCategoryId });
                  }}
                  disabled={isPending || isLoadingCategories}
                >
                  <SelectTrigger id="upcoming-category">
                    <SelectValue placeholder="All habit lists" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_CATEGORY_VALUE}>
                      All habit lists
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upcoming-type">Cadence</Label>
                <Select
                  value={questType ?? ALL_QUEST_TYPE_VALUE}
                  onValueChange={(value) => {
                    const nextQuestType =
                      value === ALL_QUEST_TYPE_VALUE ? null : (value as QuestType);

                    setQuestType(nextQuestType);
                    refreshUpcoming({ questType: nextQuestType });
                  }}
                  disabled={isPending || isLoading}
                >
                  <SelectTrigger id="upcoming-type">
                    <SelectValue placeholder="All cadences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_QUEST_TYPE_VALUE}>
                      All cadences
                    </SelectItem>
                    {QUEST_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatQuestType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryId(null);
                  setQuestType(null);
                  setHorizon(7);
                  refreshUpcoming({
                    categoryId: null,
                    horizon: 7,
                    questType: null,
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
              <CircleAlert className="size-4" />
              <AlertTitle>Upcoming update failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {isLoading ? (
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, groupIndex) => (
                <section
                  key={groupIndex}
                  className="overflow-hidden rounded-lg border border-border/80 bg-card/95 shadow-sm"
                >
                  <div className="border-b border-border/70 px-4 py-3.5">
                    <Skeleton className="h-3 w-36" />
                  </div>
                  {Array.from({ length: 3 }).map((__, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="grid gap-3 border-b border-border/70 px-4 py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto]"
                    >
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                  ))}
                </section>
              ))}
            </div>
          ) : hasNoItems ? (
            <EmptyState
              title="No upcoming recurring work"
              description="Create active daily, weekly, or monthly tasks to fill this planning view."
              action={
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/quests">Open Lists</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Open Today</Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="space-y-5">
              {payload?.groups?.map((group) => (
                <section
                  key={group.date}
                  className="overflow-hidden rounded-lg border border-border/80 bg-card/95 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/30 px-4 py-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {formatDateLabel(group.date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {group.items.length} task
                      {group.items.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div>
                    {group.items.map((item) => {
                      const itemKey = `${item.questId}:${item.periodKey}`;
                      const selected =
                        selectedItem &&
                        `${selectedItem.questId}:${selectedItem.periodKey}` === itemKey;

                      return (
                        <div
                          key={itemKey}
                          className={cn(
                            "grid gap-3 border-b border-border/70 px-4 py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto]",
                            selected && "bg-accent/30",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedKey(itemKey)}
                            className="min-w-0 text-left"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-medium text-foreground">
                                {item.title}
                              </p>
                              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                {formatQuestType(item.questType)}
                              </span>
                              {item.isCompleted ? (
                                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                                  Done
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                              <span>{item.categoryName}</span>
                              <span className="size-1 rounded-full bg-border" />
                              <span>Period {item.periodKey}</span>
                            </div>
                            {item.description ? (
                              <p className="mt-2 truncate text-xs leading-5 text-muted-foreground">
                                {item.description}
                              </p>
                            ) : null}
                          </button>

                          <div className="flex items-center gap-2 sm:justify-self-end">
                            <Button
                              size="sm"
                              variant={selected ? "secondary" : "outline"}
                              className="hidden h-8 px-3 xl:inline-flex"
                              onClick={() => setSelectedKey(itemKey)}
                            >
                              <NotebookPen className="size-4" />
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 xl:hidden"
                              onClick={() => {
                                setSelectedKey(itemKey);
                                setIsMobileDetailOpen(true);
                              }}
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

        <aside className="hidden xl:block">
          <div className="sticky top-5 rounded-lg border border-border/80 bg-card/95 p-5 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Context pane
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Inspect the projected period before switching to Today or Lists.
            </p>

            <div className="mt-5">
              {selectedItem ? (
                <UpcomingDetail item={selectedItem} />
              ) : (
                <EmptyState
                  title="Select a task"
                  description="Pick a row to inspect its projected period and list context."
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
            <SheetTitle>Upcoming detail</SheetTitle>
            <SheetDescription>
              Review the projected period without leaving the date-grouped list.
            </SheetDescription>
          </SheetHeader>

          {selectedItem ? (
            <div className="mt-5">
              <UpcomingDetail item={selectedItem} />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
