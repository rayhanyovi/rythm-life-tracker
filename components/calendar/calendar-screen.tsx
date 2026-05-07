"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  Loader2,
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

type CalendarItem = {
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

type CalendarDay = {
  completedCount: number;
  date: string;
  dayOfMonth: number;
  inMonth: boolean;
  isToday: boolean;
  items: CalendarItem[];
  totalCount: number;
};

type CalendarPayload = {
  days?: CalendarDay[];
  endDate?: string;
  error?: string;
  month?: string;
  startDate?: string;
};

type CategoriesPayload = {
  categories?: CategoryOption[];
  error?: string;
};

const ALL_CATEGORY_VALUE = "__all__";
const ALL_QUEST_TYPE_VALUE = "__all__";
const QUEST_TYPES: QuestType[] = ["DAILY", "WEEKLY", "MONTHLY"];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitialMonth() {
  return getLocalDateKey().slice(0, 7);
}

function shiftMonth(value: string, amount: number) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, month - 1 + amount, 1);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
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

function getItemKey(item: CalendarItem) {
  return `${item.questId}:${item.periodKey}`;
}

function CalendarDetail({
  day,
  item,
}: {
  day: CalendarDay | null;
  item: CalendarItem | null;
}) {
  if (!day) {
    return (
      <EmptyState
        title="Select a day"
        description="Choose a date in the month grid to inspect its recurring task agenda."
      />
    );
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Selected day
          </p>
          <h2 className="mt-1 text-[15px] font-semibold leading-6 tracking-tight text-foreground">
            {formatDateLabel(day.date)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            No recurring tasks are projected for this date with the current filters.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/quests">
            <ExternalLink className="size-4" />
            Open Lists
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {formatDateLabel(day.date)}
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
        <DetailRow label="Habit list">
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
            <CalendarDays className="size-4" />
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

export function CalendarScreen() {
  const [payload, setPayload] = useState<CalendarPayload | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [month, setMonth] = useState(getInitialMonth);
  const [selectedDate, setSelectedDate] = useState(getLocalDateKey);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [questType, setQuestType] = useState<QuestType | null>(null);
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchCalendar = useCallback(
    async (options?: {
      categoryId?: string | null;
      month?: string;
      questType?: QuestType | null;
    }) => {
      const nextCategoryId = options?.categoryId ?? categoryId;
      const nextMonth = options?.month ?? month;
      const nextQuestType = options?.questType ?? questType;
      const searchParams = new URLSearchParams({
        month: nextMonth,
      });

      if (nextCategoryId) {
        searchParams.set("categoryId", nextCategoryId);
      }

      if (nextQuestType) {
        searchParams.set("questType", nextQuestType);
      }

      const response = await fetch(`/api/calendar?${searchParams.toString()}`, {
        cache: "no-store",
      });
      const nextPayload = await readJson<CalendarPayload>(response);

      if (!response.ok || !nextPayload?.days) {
        throw new Error(nextPayload?.error ?? "Failed to load calendar.");
      }

      return nextPayload;
    },
    [categoryId, month, questType],
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
        setIsLoading(true);
        setIsLoadingCategories(true);
        setErrorMessage(null);

        const [nextPayload] = await Promise.all([
          fetchCalendar(),
          fetchCategories(),
        ]);

        if (!cancelled) {
          setPayload(nextPayload);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load calendar.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingCategories(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [fetchCalendar, fetchCategories]);

  const selectedDay = useMemo(() => {
    return payload?.days?.find((day) => day.date === selectedDate) ?? null;
  }, [payload, selectedDate]);

  const selectedItem = useMemo(() => {
    if (!selectedDay?.items.length) {
      return null;
    }

    return (
      selectedDay.items.find((item) => getItemKey(item) === selectedItemKey) ??
      selectedDay.items[0]
    );
  }, [selectedDay, selectedItemKey]);

  useEffect(() => {
    if (!payload?.days?.length) {
      return;
    }

    const currentSelection = payload.days.find((day) => day.date === selectedDate);

    if (currentSelection) {
      return;
    }

    const today = payload.days.find((day) => day.isToday && day.inMonth);
    const firstInMonth = payload.days.find((day) => day.inMonth);

    setSelectedDate((today ?? firstInMonth ?? payload.days[0]).date);
  }, [payload, selectedDate]);

  useEffect(() => {
    if (!selectedDay?.items.length) {
      setSelectedItemKey(null);
      return;
    }

    if (
      selectedItemKey &&
      selectedDay.items.some((item) => getItemKey(item) === selectedItemKey)
    ) {
      return;
    }

    setSelectedItemKey(getItemKey(selectedDay.items[0]));
  }, [selectedDay, selectedItemKey]);

  const monthStats = useMemo(() => {
    const inMonthDays = payload?.days?.filter((day) => day.inMonth) ?? [];
    const activeDays = inMonthDays.filter((day) => day.totalCount > 0);
    const totalCount = inMonthDays.reduce((sum, day) => sum + day.totalCount, 0);
    const completedCount = inMonthDays.reduce(
      (sum, day) => sum + day.completedCount,
      0,
    );

    return {
      activeDays: activeDays.length,
      completedCount,
      totalCount,
    };
  }, [payload]);

  const refreshCalendar = (options?: {
    categoryId?: string | null;
    month?: string;
    questType?: QuestType | null;
  }) => {
    startTransition(async () => {
      try {
        setErrorMessage(null);
        const nextPayload = await fetchCalendar(options);

        setPayload(nextPayload);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to refresh calendar.",
        );
      }
    });
  };

  const handleMonthChange = (nextMonth: string) => {
    setMonth(nextMonth);
    setSelectedDate(`${nextMonth}-01`);
    setSelectedItemKey(null);
    refreshCalendar({ month: nextMonth });
  };

  const handleResetToThisMonth = () => {
    const nextMonth = getInitialMonth();
    const today = getLocalDateKey();

    setMonth(nextMonth);
    setSelectedDate(today);
    setCategoryId(null);
    setQuestType(null);
    setSelectedItemKey(null);
    refreshCalendar({
      categoryId: null,
      month: nextMonth,
      questType: null,
    });
  };

  const canResetFilters =
    Boolean(categoryId || questType) || month !== getInitialMonth();

  return (
    <div className="min-h-[calc(100vh-4.25rem)] bg-card lg:h-screen lg:min-h-0 xl:grid xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="min-w-0 border-border bg-card xl:h-screen xl:overflow-y-auto xl:border-r">
        <div className="border-b border-border bg-card lg:sticky lg:top-0 lg:z-10">
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-[22px] font-semibold leading-7 tracking-tight text-foreground">
                Calendar
              </h1>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {isLoading
                  ? "loading month"
                  : `${monthStats.totalCount} tasks across ${monthStats.activeDays} days | ${monthStats.completedCount} already complete`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshCalendar()}
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
                <Link href="/quests">Add task</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-2 border-t border-border px-5 py-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(11rem,14rem)_minmax(11rem,14rem)_auto] lg:items-end">
            <div className="flex min-w-0 items-end gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0"
                onClick={() => handleMonthChange(shiftMonth(month, -1))}
                disabled={isPending}
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              <div className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Month
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                  {formatMonthLabel(month)}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0"
                onClick={() => handleMonthChange(shiftMonth(month, 1))}
                disabled={isPending}
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="calendar-category"
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
                  refreshCalendar({ categoryId: nextCategoryId });
                }}
                disabled={isPending || isLoadingCategories}
              >
                <SelectTrigger
                  id="calendar-category"
                  className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                >
                  <SelectValue placeholder="All habit lists" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORY_VALUE}>All habit lists</SelectItem>
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
                htmlFor="calendar-cadence"
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
                  refreshCalendar({ questType: nextQuestType });
                }}
                disabled={isPending}
              >
                <SelectTrigger
                  id="calendar-cadence"
                  className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                >
                  <SelectValue placeholder="All cadences" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_QUEST_TYPE_VALUE}>All cadences</SelectItem>
                  {QUEST_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatQuestType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-full lg:w-auto"
                onClick={handleResetToThisMonth}
                disabled={isPending || !canResetFilters}
              >
                This month
              </Button>
            </div>
          </div>

        </div>

        {errorMessage ? (
          <div className="px-5 pt-4">
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertTitle>Calendar needs attention</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </div>
        ) : null}

        <div className="px-5 py-4">
            {isLoading ? (
              <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
                {Array.from({ length: 42 }, (_, index) => (
                  <Skeleton key={index} className="h-20 rounded-none sm:h-24" />
                ))}
              </div>
            ) : payload?.days?.length ? (
              <div className="overflow-hidden rounded-lg border border-border/80">
                <div className="grid grid-cols-7 border-b border-border/70 bg-muted/40">
                  {WEEKDAY_LABELS.map((label) => (
                    <div
                      key={label}
                      className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 bg-border/70 gap-px">
                  {payload.days.map((day) => {
                    const selected = day.date === selectedDate;
                    const completionLabel =
                      day.totalCount > 0
                        ? `${day.completedCount}/${day.totalCount}`
                        : "";

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(day.date);
                          setSelectedItemKey(null);
                        }}
                        className={cn(
                          "min-h-20 bg-background p-2 text-left transition-[background-color,color] sm:min-h-24",
                          !day.inMonth && "bg-muted/30 text-muted-foreground/60",
                          selected && "bg-accent",
                        )}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className={cn(
                              "flex size-7 items-center justify-center rounded-sm text-xs font-semibold",
                              day.isToday && "bg-primary text-primary-foreground",
                              selected && !day.isToday && "bg-background text-foreground",
                            )}
                          >
                            {day.dayOfMonth}
                          </span>
                          {completionLabel ? (
                            <span className="rounded-sm border border-border bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {completionLabel}
                            </span>
                          ) : null}
                        </div>
                        {day.totalCount > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {day.items.slice(0, 3).map((item) => (
                              <span
                                key={getItemKey(item)}
                                className={cn(
                                  "size-1.5 rounded-full",
                                  item.isCompleted ? "bg-primary" : "bg-muted-foreground/35",
                                )}
                              />
                            ))}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Calendar is empty"
                description="Create active daily, weekly, or monthly tasks to fill this planning view."
                action={
                  <Button asChild>
                    <Link href="/quests">Open Lists</Link>
                  </Button>
                }
              />
            )}
        </div>

        <div className="pb-5">
          <div className="flex items-center justify-between gap-3 border-t border-border px-5 pb-1.5 pt-4">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Selected day agenda
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedDay ? formatDateLabel(selectedDay.date) : "No day selected"}
              </p>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">
              {selectedDay?.totalCount ?? 0} task
              {(selectedDay?.totalCount ?? 0) === 1 ? "" : "s"}
            </p>
          </div>

          {selectedDay?.items.length ? (
            <div className="border-t border-border">
              {selectedDay.items.map((item) => {
                const itemKey = getItemKey(item);
                const selected = selectedItem && getItemKey(selectedItem) === itemKey;

                return (
                  <div
                    key={itemKey}
                    className={cn(
                      "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-5 py-2.5 transition-colors duration-[160ms] ease-out last:border-b-0",
                      selected ? "bg-accent" : "bg-card hover:bg-muted/35",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedItemKey(itemKey)}
                      className="min-w-0 text-left"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-[13px] font-medium leading-5 text-foreground">
                          {item.title}
                        </p>
                        <CadenceBadge type={item.questType} />
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
                            style={{
                              backgroundColor: getCategoryColor(item.categoryName),
                            }}
                          />
                          <span className="truncate">{item.categoryName}</span>
                        </span>
                        <span className="font-mono text-[10px]">{item.periodKey}</span>
                      </div>
                      {item.description ? (
                        <p className="mt-1 truncate text-xs leading-5 text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant={selected ? "secondary" : "outline"}
                        className="hidden h-8 px-2 text-xs xl:inline-flex"
                        onClick={() => setSelectedItemKey(itemKey)}
                      >
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-xs xl:hidden"
                        onClick={() => {
                          setSelectedItemKey(itemKey);
                          setIsMobileDetailOpen(true);
                        }}
                      >
                        Detail
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4">
              <EmptyState
                title="No tasks on this date"
                description="Pick another day, adjust filters, or add recurring tasks from Lists."
                action={
                  <Button asChild variant="outline">
                    <Link href="/quests">Open Lists</Link>
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </section>

      <aside className="hidden bg-background xl:block xl:h-screen xl:overflow-y-auto">
        <div className="p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Context pane
          </p>
          <div className="mt-4">
            <CalendarDetail day={selectedDay} item={selectedItem} />
          </div>
        </div>
      </aside>

      <Sheet open={isMobileDetailOpen} onOpenChange={setIsMobileDetailOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[88vh] overflow-y-auto rounded-t-[1.25rem]"
        >
          <SheetHeader>
            <SheetTitle>Calendar detail</SheetTitle>
            <SheetDescription>
              Inspect the selected day without leaving Calendar.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-5">
            <CalendarDetail day={selectedDay} item={selectedItem} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
