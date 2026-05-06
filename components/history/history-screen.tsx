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
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Selected completion
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {item.questTitle}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{item.categoryName}</span>
          <span className="size-1 rounded-full bg-border" />
          <span>{formatQuestType(item.questType)}</span>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Completed on {formatHistoryDayLabel(item.completedAt)} at{" "}
          {formatHistoryTime(item.completedAt)}.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={noteInputId}>Completion note</Label>
        <Textarea
          id={noteInputId}
          value={noteDraft}
          onChange={(event) => onChangeNote(event.target.value)}
          placeholder="Add context that will matter when you review this completion later."
          disabled={isPending}
          className="min-h-32"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
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
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onDelete}
          disabled={isPending}
        >
          <Trash2 className="size-4" />
          Remove completion
        </Button>
      </div>
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
  const [selectedCompletionId, setSelectedCompletionId] = useState<string | null>(null);
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
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-5">
          <section className="border-b border-border/70 pb-4">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Tasks / Activity Log
              </p>
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  Activity Log
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  Review recent completions, filter the Activity Log, and keep
                  note edits or removal actions close to the selected record.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="activity-from">From</Label>
                <Input
                  id="activity-from"
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-to">To</Label>
                <Input
                  id="activity-to"
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-category">List</Label>
                <Select
                  value={categoryFilterId ?? ALL_CATEGORY_VALUE}
                  onValueChange={(value) =>
                    setCategoryFilterId(value === ALL_CATEGORY_VALUE ? null : value)
                  }
                  disabled={isPending || isLoadingFilters}
                >
                  <SelectTrigger id="activity-category">
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
                <Label htmlFor="activity-type">Task type</Label>
                <Select
                  value={questTypeFilter ?? ALL_QUEST_TYPE_VALUE}
                  onValueChange={(value) =>
                    setQuestTypeFilter(
                      value === ALL_QUEST_TYPE_VALUE ? null : (value as QuestType),
                    )
                  }
                  disabled={isPending}
                >
                  <SelectTrigger id="activity-type">
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
              <div className="space-y-2">
                <Label htmlFor="activity-quest">Task</Label>
                <Select
                  value={questFilterId ?? ALL_QUEST_VALUE}
                  onValueChange={(value) =>
                    setQuestFilterId(value === ALL_QUEST_VALUE ? null : value)
                  }
                  disabled={isPending || isLoadingFilters}
                >
                  <SelectTrigger id="activity-quest">
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

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="outline"
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
              <Button asChild variant="ghost">
                <Link href="/dashboard">Back to Today</Link>
              </Button>
            </div>
          </section>

          {errorMessage ? (
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertTitle>Activity log update failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {isLoadingFilters || isLoadingHistory ? (
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <section
                  key={index}
                  className="overflow-hidden rounded-lg border border-border/80 bg-card/95 shadow-sm"
                >
                  <div className="border-b border-border/70 px-4 py-3.5">
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div>
                    {Array.from({ length: 3 }).map((__, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="grid gap-3 border-b border-border/70 px-4 py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto]"
                      >
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-44" />
                          <Skeleton className="h-3 w-28" />
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
          ) : (
            <>
              <div className="space-y-5">
                {groupedItems.map((group) => (
                  <section
                    key={group.dayKey}
                    className="overflow-hidden rounded-lg border border-border/80 bg-card/95 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/30 px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {group.dayLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {group.items.length} item{group.items.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div>
                      {group.items.map((item) => {
                        const selected =
                          selectedCompletion?.completionId === item.completionId;

                        return (
                          <div
                            key={item.completionId}
                            className={cn(
                              "grid gap-3 border-b border-border/70 px-4 py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto]",
                              selected && "bg-accent/30",
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedCompletionId(item.completionId)}
                              className="min-w-0 text-left"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {item.questTitle}
                                </p>
                                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                  {formatQuestType(item.questType)}
                                </span>
                                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                  {item.categoryName}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                <span>{formatHistoryTime(item.completedAt)}</span>
                              </div>
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                {item.note ?? "No note for this completion."}
                              </p>
                            </button>

                            <div className="flex items-center gap-2 sm:justify-self-end">
                              <Button
                                size="sm"
                                variant={selected ? "secondary" : "outline"}
                                className="hidden h-8 px-3 xl:inline-flex"
                                onClick={() => setSelectedCompletionId(item.completionId)}
                              >
                                <NotebookPen className="size-4" />
                                Detail
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 xl:hidden"
                                onClick={() => {
                                  setSelectedCompletionId(item.completionId);
                                  setIsMobileDetailOpen(true);
                                }}
                              >
                                <NotebookPen className="size-4" />
                                Detail
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteTarget(item)}
                              >
                                <Trash2 className="size-4" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              {nextCursor ? (
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
              ) : null}
            </>
          )}
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-5 rounded-lg border border-border/80 bg-card/95 p-5 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Context pane
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Keep note editing and delete confirmation attached to the selected
              completion.
            </p>

            <div className="mt-5">
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
