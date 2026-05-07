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
import { getCategoryColor } from "@/lib/category-colors";
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

function UpcomingDetail({ item }: { item: UpcomingItem }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Planned period
        </p>
        <h2 className="text-[15px] font-semibold leading-6 tracking-tight text-foreground">
          {item.title}
        </h2>
        {item.description ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        ) : null}
      </div>

      <div className="space-y-4 border-y border-border py-4">
        <DetailRow label="Habit List">
          <span className="inline-flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: getCategoryColor(item.categoryName) }}
            />
            {item.categoryName}
          </span>
        </DetailRow>
        <DetailRow label="Cadence">
          <CadenceBadge type={item.questType} />
        </DetailRow>
        <DetailRow label="Status">
          {item.isCompleted ? "Already completed" : "Not completed yet"}
        </DetailRow>
        <DetailRow label="Period">{item.periodKey}</DetailRow>
        <DetailRow label="Completion note">
          {item.note ?? "No completion note for this period."}
        </DetailRow>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href="/dashboard">
            <CalendarClock className="size-4" />
            Open Today
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/quests">
            <ExternalLink className="size-4" />
            Manage task
          </Link>
        </Button>
      </div>
    </div>
  );
}

function UpcomingRow({
  item,
  onOpenMobileDetail,
  onSelect,
  selected,
}: {
  item: UpcomingItem;
  onOpenMobileDetail: () => void;
  onSelect: () => void;
  selected: boolean | null;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-5 py-2.5 transition-colors duration-[160ms] ease-out last:border-b-0",
        selected ? "bg-accent" : "bg-card hover:bg-muted/35",
      )}
    >
      <button type="button" onClick={onSelect} className="min-w-0 text-left">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[13px] font-medium leading-5 text-foreground">
            {item.title}
          </p>
          {item.isCompleted ? (
            <span className="shrink-0 rounded-lg border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-primary">
              Done
            </span>
          ) : null}
        </div>

        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: getCategoryColor(item.categoryName) }}
            />
            <span className="truncate">{item.categoryName}</span>
          </span>
          <CadenceBadge type={item.questType} />
          <span className="font-mono text-[10px]">{item.periodKey}</span>
        </div>
      </button>

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
  );
}

function UpcomingSkeleton() {
  return (
    <div className="py-2">
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <section key={sectionIndex}>
          <div className="flex items-center gap-2 px-5 pb-1.5 pt-4">
            <Skeleton className="h-3 w-36 rounded-sm" />
            <Skeleton className="h-3 w-5 rounded-sm" />
          </div>
          <div className="border-t border-border">
            {Array.from({ length: 3 }).map((__, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-2 border-b border-border px-5 py-3"
              >
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-48 rounded-sm" />
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
      <div className="min-h-[calc(100vh-4.25rem)] bg-card lg:h-screen lg:min-h-0 xl:grid xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 border-border bg-card xl:h-screen xl:overflow-y-auto xl:border-r">
          <section className="border-b border-border bg-card lg:sticky lg:top-0 lg:z-10">
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-[22px] font-semibold leading-7 tracking-tight text-foreground">
                  Upcoming
                </h1>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {formatDateShort(payload?.startDate)} to{" "}
                  {formatDateShort(payload?.endDate)} |{" "}
                  {isLoading
                    ? "loading upcoming work"
                    : `${stats.totalCount} tasks across ${stats.dateCount} dates | ${stats.completedCount} already complete`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
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
                <Button asChild size="sm">
                  <Link href="/quests">
                    <ExternalLink className="size-4" />
                    Add task
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-2 border-t border-border px-5 py-3 md:grid-cols-[9rem_minmax(0,1fr)_12rem_auto] md:items-end">
              <div className="space-y-1.5">
                <Label
                  htmlFor="upcoming-horizon"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  Horizon
                </Label>
                <Select
                  value={String(horizon)}
                  onValueChange={(value) => {
                    const nextHorizon = Number(value) as typeof horizon;

                    setHorizon(nextHorizon);
                    refreshUpcoming({ horizon: nextHorizon });
                  }}
                  disabled={isPending || isLoading}
                >
                  <SelectTrigger
                    id="upcoming-horizon"
                    className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                  >
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

              <div className="space-y-1.5">
                <Label
                  htmlFor="upcoming-category"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  Habit list
                </Label>
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
                  <SelectTrigger
                    id="upcoming-category"
                    className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                  >
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

              <div className="space-y-1.5">
                <Label
                  htmlFor="upcoming-type"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  Cadence
                </Label>
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
                  <SelectTrigger
                    id="upcoming-type"
                    className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                  >
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
                <AlertTitle>Upcoming update failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          {isLoading ? (
            <UpcomingSkeleton />
          ) : hasNoItems ? (
            <div className="p-5">
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
            </div>
          ) : (
            <div className="pb-5">
              {payload?.groups?.map((group) => (
                <section key={group.date}>
                  <SectionLabel
                    label={formatDateLabel(group.date)}
                    count={group.items.length}
                  />
                  <div className="border-t border-border">
                    {group.items.map((item) => {
                      const itemKey = `${item.questId}:${item.periodKey}`;
                      const selected =
                        selectedItem &&
                        `${selectedItem.questId}:${selectedItem.periodKey}` ===
                          itemKey;

                      return (
                        <UpcomingRow
                          key={itemKey}
                          item={item}
                          selected={selected}
                          onSelect={() => setSelectedKey(itemKey)}
                          onOpenMobileDetail={() => {
                            setSelectedKey(itemKey);
                            setIsMobileDetailOpen(true);
                          }}
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
