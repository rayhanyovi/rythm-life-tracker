"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  CircleAlert,
  Loader2,
  NotebookPen,
  SearchX,
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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getCategoryColor } from "@/lib/category-colors";
import { cn } from "@/lib/utils";

type QuestType = "DAILY" | "WEEKLY" | "MONTHLY" | "MAIN";

type CategoryOption = {
  id: string;
  name: string;
  sortOrder: number;
};

type QuestOption = {
  id: string;
  title: string;
  categoryId: string;
  questType: QuestType;
  isActive: boolean;
  category: CategoryOption;
};

type HistoryItem = {
  completionId: string;
  completedAt: string;
  note: string | null;
  questId: string;
  questTitle: string;
  questType: QuestType;
  categoryId: string;
  categoryName: string;
  periodKey: string;
};

type HistoryPayload = {
  items?: HistoryItem[];
  nextCursor?: string | null;
  error?: string;
};

type CategoriesPayload = {
  categories?: CategoryOption[];
  error?: string;
};

type QuestsPayload = {
  quests?: QuestOption[];
  error?: string;
};

type CompletionPayload = {
  completion?: {
    id: string;
    note: string | null;
  };
  error?: string;
};

type DeletePayload = {
  error?: string;
};

const QUEST_TYPES: QuestType[] = ["DAILY", "WEEKLY", "MONTHLY", "MAIN"];
const ALL_CATEGORY_VALUE = "__all__";
const ALL_QUEST_TYPE_VALUE = "__all__";
const ALL_QUEST_VALUE = "__all__";

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

function formatQuestType(value: QuestType) {
  return QUEST_TYPE_LABELS[value];
}

function formatHistoryDayKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatHistoryDayLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatHistoryTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
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

function HistoryDetail({
  isPending,
  noteDraft,
  noteInputId,
  onChangeNote,
  onDelete,
  onSaveNote,
  item,
}: {
  isPending: boolean;
  noteDraft: string;
  noteInputId: string;
  onChangeNote: (value: string) => void;
  onDelete: () => void;
  onSaveNote: () => void;
  item: HistoryItem;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Selected completion
        </p>
        <h2 className="text-[15px] font-semibold leading-6 tracking-tight text-foreground">
          {item.questTitle}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Completed on {formatHistoryDayLabel(item.completedAt)} at{" "}
          {formatHistoryTime(item.completedAt)}.
        </p>
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
        <DetailRow label="Period">{item.periodKey}</DetailRow>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor={noteInputId}
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Completion note
        </Label>
        <Textarea
          id={noteInputId}
          value={noteDraft}
          onChange={(event) => onChangeNote(event.target.value)}
          placeholder="Add context that will matter when you review this completion later."
          disabled={isPending}
          className="min-h-32 resize-none rounded-lg bg-card text-sm shadow-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={onSaveNote}
          disabled={isPending || noteDraft === (item.note ?? "")}
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
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onDelete}
          disabled={isPending}
        >
          <Trash2 className="size-4" />
          Remove
        </Button>
      </div>
    </div>
  );
}

function HistoryRow({
  item,
  onDelete,
  onOpenMobileDetail,
  onSelect,
  selected,
}: {
  item: HistoryItem;
  onDelete: () => void;
  onOpenMobileDetail: () => void;
  onSelect: () => void;
  selected: boolean;
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
            {item.questTitle}
          </p>
          <CadenceBadge type={item.questType} />
        </div>

        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono text-[10px]">
            {formatHistoryTime(item.completedAt)}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: getCategoryColor(item.categoryName) }}
            />
            <span className="truncate">{item.categoryName}</span>
          </span>
          <span className="font-mono text-[10px]">{item.periodKey}</span>
        </div>

        <p className="mt-1 truncate text-xs leading-5 text-muted-foreground">
          {item.note ?? "No note for this completion."}
        </p>
      </button>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant={selected ? "secondary" : "outline"}
          className="hidden h-8 px-2 text-xs xl:inline-flex"
          onClick={onSelect}
        >
          <NotebookPen className="size-4" />
          Detail
        </Button>
        <Button
          size="sm"
          variant={selected ? "secondary" : "outline"}
          className="h-8 px-2 text-xs xl:hidden"
          onClick={onOpenMobileDetail}
        >
          <NotebookPen className="size-4" />
          Detail
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Remove completion</span>
        </Button>
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="py-2">
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <section key={sectionIndex}>
          <div className="flex items-center gap-2 px-5 pb-1.5 pt-4">
            <Skeleton className="h-3 w-44 rounded-sm" />
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
                <Skeleton className="h-3 w-8 justify-self-end rounded-sm" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [quests, setQuests] = useState<QuestOption[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [categoryFilterId, setCategoryFilterId] = useState<string | null>(null);
  const [questFilterId, setQuestFilterId] = useState<string | null>(null);
  const [questTypeFilter, setQuestTypeFilter] = useState<QuestType | null>(null);
  const [selectedCompletionId, setSelectedCompletionId] = useState<string | null>(
    null,
  );
  const [noteDraft, setNoteDraft] = useState("");
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HistoryItem | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchCategories = useCallback(async () => {
    const response = await fetch("/api/categories", {
      cache: "no-store",
    });
    const payload = await readJson<CategoriesPayload>(response);

    if (!response.ok || !payload?.categories) {
      throw new Error(payload?.error ?? "Failed to load habit lists.");
    }

    return payload.categories;
  }, []);

  const fetchQuests = useCallback(async () => {
    const response = await fetch("/api/quests?includeInactive=true", {
      cache: "no-store",
    });
    const payload = await readJson<QuestsPayload>(response);

    if (!response.ok || !payload?.quests) {
      throw new Error(payload?.error ?? "Failed to load tasks.");
    }

    return payload.quests;
  }, []);

  const fetchHistory = useCallback(
    async (cursor?: string | null) => {
      const searchParams = new URLSearchParams();

      if (fromDate) searchParams.set("from", fromDate);
      if (toDate) searchParams.set("to", toDate);
      if (categoryFilterId) searchParams.set("categoryId", categoryFilterId);
      if (questFilterId) searchParams.set("questId", questFilterId);
      if (questTypeFilter) searchParams.set("questType", questTypeFilter);
      if (cursor) searchParams.set("cursor", cursor);

      const query = searchParams.toString();
      const response = await fetch(query ? `/api/history?${query}` : "/api/history", {
        cache: "no-store",
      });
      const payload = await readJson<HistoryPayload>(response);

      if (!response.ok || !payload?.items) {
        throw new Error(payload?.error ?? "Failed to load activity log.");
      }

      return {
        items: payload.items,
        nextCursor: payload.nextCursor ?? null,
      };
    },
    [categoryFilterId, fromDate, questFilterId, questTypeFilter, toDate],
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const [nextCategories, nextQuests] = await Promise.all([
          fetchCategories(),
          fetchQuests(),
        ]);

        if (!cancelled) {
          setCategories(nextCategories);
          setQuests(nextQuests);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to load activity log filters.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingFilters(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchCategories, fetchQuests]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setErrorMessage(null);
      setIsLoadingHistory(true);

      try {
        const payload = await fetchHistory();

        if (!cancelled) {
          setItems(payload.items);
          setNextCursor(payload.nextCursor);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load activity log.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingHistory(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchHistory]);

  const visibleQuestFilters = useMemo(() => {
    return quests.filter((quest) => {
      if (categoryFilterId && quest.categoryId !== categoryFilterId) {
        return false;
      }

      if (questTypeFilter && quest.questType !== questTypeFilter) {
        return false;
      }

      return true;
    });
  }, [categoryFilterId, questTypeFilter, quests]);

  useEffect(() => {
    if (!questFilterId) {
      return;
    }

    const stillVisible = visibleQuestFilters.some(
      (quest) => quest.id === questFilterId,
    );

    if (!stillVisible) {
      setQuestFilterId(null);
    }
  }, [questFilterId, visibleQuestFilters]);

  const selectedCompletion = useMemo(() => {
    if (!items.length) {
      return null;
    }

    return items.find((item) => item.completionId === selectedCompletionId) ?? items[0];
  }, [items, selectedCompletionId]);

  useEffect(() => {
    if (!selectedCompletion) {
      setSelectedCompletionId(null);
      setNoteDraft("");
      return;
    }

    setSelectedCompletionId(selectedCompletion.completionId);
    setNoteDraft(selectedCompletion.note ?? "");
  }, [selectedCompletion]);

  const groupedItems = useMemo(() => {
    const groups = new Map<
      string,
      {
        dayKey: string;
        dayLabel: string;
        items: HistoryItem[];
      }
    >();

    for (const item of items) {
      const dayKey = formatHistoryDayKey(item.completedAt);
      const existingGroup = groups.get(dayKey) ?? {
        dayKey,
        dayLabel: formatHistoryDayLabel(item.completedAt),
        items: [],
      };

      existingGroup.items.push(item);
      groups.set(dayKey, existingGroup);
    }

    return [...groups.values()];
  }, [items]);

  const hasActiveFilters =
    fromDate.length > 0 ||
    toDate.length > 0 ||
    categoryFilterId !== null ||
    questFilterId !== null ||
    questTypeFilter !== null;

  const hasNoItems = !isLoadingHistory && items.length === 0;

  const refreshHistory = async () => {
    const payload = await fetchHistory();
    setItems(payload.items);
    setNextCursor(payload.nextCursor);
  };

  const loadMore = () => {
    if (!nextCursor) {
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      try {
        const payload = await fetchHistory(nextCursor);
        setItems((current) => [...current, ...payload.items]);
        setNextCursor(payload.nextCursor);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load more activity.",
        );
      }
    });
  };

  const handleSaveNote = () => {
    if (!selectedCompletion) {
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch(
        `/api/completions/${selectedCompletion.completionId}`,
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
      const payload = await readJson<CompletionPayload>(response);

      if (!response.ok || !payload?.completion) {
        setErrorMessage(payload?.error ?? "Failed to update note.");
        return;
      }

      toast.success(`Updated note for "${selectedCompletion.questTitle}".`);
      await refreshHistory();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/completions/${deleteTarget.completionId}`, {
        method: "DELETE",
      });
      const payload = await readJson<DeletePayload>(response);

      if (!response.ok && response.status !== 204) {
        setErrorMessage(payload?.error ?? "Failed to delete completion.");
        return;
      }

      setDeleteTarget(null);
      toast.success(`Removed "${deleteTarget.questTitle}" from activity log.`);

      if (selectedCompletionId === deleteTarget.completionId) {
        setSelectedCompletionId(null);
      }

      await refreshHistory();
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
                  Activity Log
                </h1>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {isLoadingHistory
                    ? "loading completion records"
                    : `${items.length} completions in view`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard">Open Today</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                    setCategoryFilterId(null);
                    setQuestFilterId(null);
                    setQuestTypeFilter(null);
                  }}
                  disabled={!hasActiveFilters || isPending}
                >
                  Reset filters
                </Button>
              </div>
            </div>

            <div className="grid gap-2 border-t border-border px-5 py-3 md:grid-cols-2 xl:grid-cols-[8.5rem_8.5rem_minmax(9rem,1fr)_9rem_minmax(9rem,1fr)]">
              <div className="space-y-1.5">
                <Label
                  htmlFor="activity-from"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  From
                </Label>
                <Input
                  id="activity-from"
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="activity-to"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  To
                </Label>
                <Input
                  id="activity-to"
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="activity-category"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  Habit list
                </Label>
                <Select
                  value={categoryFilterId ?? ALL_CATEGORY_VALUE}
                  onValueChange={(value) =>
                    setCategoryFilterId(value === ALL_CATEGORY_VALUE ? null : value)
                  }
                  disabled={isPending || isLoadingFilters}
                >
                  <SelectTrigger
                    id="activity-category"
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
                  htmlFor="activity-type"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  Cadence
                </Label>
                <Select
                  value={questTypeFilter ?? ALL_QUEST_TYPE_VALUE}
                  onValueChange={(value) =>
                    setQuestTypeFilter(
                      value === ALL_QUEST_TYPE_VALUE ? null : (value as QuestType),
                    )
                  }
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="activity-type"
                    className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                  >
                    <SelectValue placeholder="All cadences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_QUEST_TYPE_VALUE}>
                      All cadences
                    </SelectItem>
                    {QUEST_TYPES.map((questType) => (
                      <SelectItem key={questType} value={questType}>
                        {formatQuestType(questType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="activity-quest"
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  Task
                </Label>
                <Select
                  value={questFilterId ?? ALL_QUEST_VALUE}
                  onValueChange={(value) =>
                    setQuestFilterId(value === ALL_QUEST_VALUE ? null : value)
                  }
                  disabled={isPending || isLoadingFilters}
                >
                  <SelectTrigger
                    id="activity-quest"
                    className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                  >
                    <SelectValue placeholder="All tasks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_QUEST_VALUE}>All tasks</SelectItem>
                    {visibleQuestFilters.map((quest) => (
                      <SelectItem key={quest.id} value={quest.id}>
                        {quest.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {errorMessage ? (
            <div className="px-5 pt-4">
              <Alert variant="destructive">
                <CircleAlert className="size-4" />
                <AlertTitle>Activity log update failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          {isLoadingFilters || isLoadingHistory ? (
            <HistorySkeleton />
          ) : hasNoItems ? (
            <div className="p-5">
              <EmptyState
                title="No activity in this view"
                description="Complete something from Today first, or relax the filters if this Activity Log view is too narrow."
                action={
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href="/dashboard">Open Today</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/quests">Open Lists</Link>
                    </Button>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="pb-5">
              {groupedItems.map((group) => (
                <section key={group.dayKey}>
                  <SectionLabel label={group.dayLabel} count={group.items.length} />
                  <div className="border-t border-border">
                    {group.items.map((item) => {
                      const selected =
                        selectedCompletion?.completionId === item.completionId;

                      return (
                        <HistoryRow
                          key={item.completionId}
                          item={item}
                          selected={selected}
                          onSelect={() => setSelectedCompletionId(item.completionId)}
                          onOpenMobileDetail={() => {
                            setSelectedCompletionId(item.completionId);
                            setIsMobileDetailOpen(true);
                          }}
                          onDelete={() => setDeleteTarget(item)}
                        />
                      );
                    })}
                  </div>
                </section>
              ))}

              {nextCursor ? (
                <div className="px-5 pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={loadMore}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <SearchX className="size-4" />
                    )}
                    Load more
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <aside className="hidden bg-background xl:block xl:h-screen xl:overflow-y-auto">
          <div className="p-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Context pane
            </p>

            <div className="mt-4">
              {selectedCompletion ? (
                <HistoryDetail
                  item={selectedCompletion}
                  noteInputId="activity-log-note-context"
                  noteDraft={noteDraft}
                  onChangeNote={setNoteDraft}
                  onDelete={() => setDeleteTarget(selectedCompletion)}
                  onSaveNote={handleSaveNote}
                  isPending={isPending}
                />
              ) : (
                <EmptyState
                  title="Select a completion"
                  description="Choose any row to inspect the note, completion time, and remove action without leaving Activity Log."
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
            <SheetTitle>Completion detail</SheetTitle>
            <SheetDescription>
              Keep correction inside the Activity Log flow.
            </SheetDescription>
          </SheetHeader>

          {selectedCompletion ? (
            <div className="mt-5">
              <HistoryDetail
                item={selectedCompletion}
                noteInputId="activity-log-note-sheet"
                noteDraft={noteDraft}
                onChangeNote={setNoteDraft}
                onDelete={() => setDeleteTarget(selectedCompletion)}
                onSaveNote={handleSaveNote}
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
            <AlertDialogTitle>Remove completion</AlertDialogTitle>
            <AlertDialogDescription>
              Remove &quot;{deleteTarget?.questTitle}&quot; from the activity log only if
              this completion record should be gone. The task itself will remain.
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
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
