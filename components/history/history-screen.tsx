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
  CircleAlert,
  Loader2,
  NotebookPen,
  SearchX,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { DetailPanel } from "@/components/app/detail-panel";
import { DetailStat } from "@/components/app/detail-stat";
import { EmptyState } from "@/components/app/empty-state";
import { InteractiveListCard } from "@/components/app/interactive-list-card";
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
import { Input } from "@/components/ui/input";
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
  MAIN: "Main quest",
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

export function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [quests, setQuests] = useState<QuestOption[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [categoryFilterId, setCategoryFilterId] = useState<string | null>(null);
  const [questFilterId, setQuestFilterId] = useState<string | null>(null);
  const [questTypeFilter, setQuestTypeFilter] = useState<QuestType | null>(
    null,
  );
  const [selectedCompletionId, setSelectedCompletionId] = useState<string | null>(
    null,
  );
  const [noteDraft, setNoteDraft] = useState("");
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HistoryItem | null>(null);
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

  const fetchQuests = useCallback(async () => {
    const response = await fetch("/api/quests?includeInactive=true", {
      cache: "no-store",
    });
    const payload = await readJson<QuestsPayload>(response);

    if (!response.ok || !payload?.quests) {
      throw new Error(payload?.error ?? "Failed to load quests.");
    }

    return payload.quests;
  }, []);

  const fetchHistory = useCallback(
    async (cursor?: string | null) => {
      const searchParams = new URLSearchParams();

      if (fromDate) {
        searchParams.set("from", fromDate);
      }

      if (toDate) {
        searchParams.set("to", toDate);
      }

      if (categoryFilterId) {
        searchParams.set("categoryId", categoryFilterId);
      }

      if (questFilterId) {
        searchParams.set("questId", questFilterId);
      }

      if (questTypeFilter) {
        searchParams.set("questType", questTypeFilter);
      }

      if (cursor) {
        searchParams.set("cursor", cursor);
      }

      const query = searchParams.toString();
      const response = await fetch(
        query ? `/api/history?${query}` : "/api/history",
        {
          cache: "no-store",
        },
      );
      const payload = await readJson<HistoryPayload>(response);

      if (!response.ok || !payload?.items) {
        throw new Error(payload?.error ?? "Failed to load history.");
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
              : "Failed to load history filters.",
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
            error instanceof Error ? error.message : "Failed to load history.",
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

    return (
      items.find((item) => item.completionId === selectedCompletionId) ?? items[0]
    );
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
          error instanceof Error ? error.message : "Failed to load more history.",
        );
      }
    });
  };

  const refreshHistory = async () => {
    const payload = await fetchHistory();
    setItems(payload.items);
    setNextCursor(payload.nextCursor);
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
      toast.success(`Removed "${deleteTarget.questTitle}" from history.`);

      if (selectedCompletionId === deleteTarget.completionId) {
        setSelectedCompletionId(null);
      }

      await refreshHistory();
    });
  };

  return (
    <>
      <Card>
        <CardContent className="space-y-6 p-6">
          <PageIntro
            eyebrow="Completion archive"
            title="Review notes without opening analytics"
            description="Filter by time window, quest, category, or recurrence type, then keep note edits and deletion close to the selected completion."
            actions={
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
            }
          />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="history-from">From</Label>
              <Input
                id="history-from"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history-to">To</Label>
              <Input
                id="history-to"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history-category">Category</Label>
              <Select
                value={categoryFilterId ?? ALL_CATEGORY_VALUE}
                onValueChange={(value) =>
                  setCategoryFilterId(
                    value === ALL_CATEGORY_VALUE ? null : value,
                  )
                }
                disabled={isPending || isLoadingFilters}
              >
                <SelectTrigger id="history-category">
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
            <div className="space-y-2">
              <Label htmlFor="history-quest-type">Quest type</Label>
              <Select
                value={questTypeFilter ?? ALL_QUEST_TYPE_VALUE}
                onValueChange={(value) =>
                  setQuestTypeFilter(
                    value === ALL_QUEST_TYPE_VALUE ? null : (value as QuestType),
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger id="history-quest-type">
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
              <Label htmlFor="history-quest">Quest</Label>
              <Select
                value={questFilterId ?? ALL_QUEST_VALUE}
                onValueChange={(value) =>
                  setQuestFilterId(value === ALL_QUEST_VALUE ? null : value)
                }
                disabled={isPending || isLoadingFilters}
              >
                <SelectTrigger id="history-quest">
                  <SelectValue placeholder="All quests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_QUEST_VALUE}>All quests</SelectItem>
                  {visibleQuestFilters.map((quest) => (
                    <SelectItem key={quest.id} value={quest.id}>
                      {quest.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          {errorMessage ? (
            <Alert variant="destructive">
              <CircleAlert className="size-4" />
              <AlertTitle>History update failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {isLoadingFilters || isLoadingHistory ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="space-y-3 p-6">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : hasNoItems ? (
            <EmptyState
              title="No history in the current view"
              description="Complete quests from the dashboard first, or relax the filters if the archive feels too narrow."
              action={
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/dashboard">Open dashboard</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/quests">Manage quests</Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <>
              <div className="space-y-6">
                {groupedItems.map((group) => (
                  <div key={group.dayKey} className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {group.dayLabel}
                    </p>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <InteractiveListCard
                          key={item.completionId}
                          selected={
                            selectedCompletion?.completionId === item.completionId
                          }
                          actions={
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedCompletionId(item.completionId)}
                                disabled={isPending}
                              >
                                <NotebookPen className="size-4" />
                                Note
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setDeleteTarget(item)}
                                disabled={isPending}
                              >
                                <Trash2 className="size-4" />
                                Remove
                              </Button>
                            </>
                          }
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedCompletionId(item.completionId)}
                            className="min-w-0 text-left"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-foreground">
                                {item.questTitle}
                              </p>
                              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                {formatQuestType(item.questType)}
                              </span>
                              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                                {item.categoryName}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Period {item.periodKey} · {formatHistoryTime(item.completedAt)}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {item.note ?? "No note for this completion."}
                            </p>
                          </button>
                        </InteractiveListCard>
                      ))}
                    </div>
                  </div>
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

        <DetailPanel
          title="Completion detail"
          description="Keep note editing and delete confirmation close to the selected row so history remains operational, not analytical."
        >
            {selectedCompletion ? (
              <>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-foreground">
                      {selectedCompletion.questTitle}
                    </p>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {formatQuestType(selectedCompletion.questType)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedCompletion.categoryName}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Completed on{" "}
                    {formatHistoryDayLabel(selectedCompletion.completedAt)} at{" "}
                    {formatHistoryTime(selectedCompletion.completedAt)}.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <DetailStat
                    label="Period key"
                    value={selectedCompletion.periodKey}
                  />
                  <DetailStat
                    label="Completion id"
                    value={
                      <span className="block truncate">
                        {selectedCompletion.completionId}
                      </span>
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="history-note">Completion note</Label>
                  <Textarea
                    id="history-note"
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    placeholder="Add context that will matter when you review this completion later."
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={handleSaveNote}
                    disabled={
                      isPending || noteDraft === (selectedCompletion.note ?? "")
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
                    className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    variant="ghost"
                    onClick={() => setDeleteTarget(selectedCompletion)}
                    disabled={isPending}
                  >
                    <Trash2 className="size-4" />
                    Remove completion
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState
                title="Select a completion"
                description="Choose any history row to inspect the note, period key, and removal action."
              />
            )}
        </DetailPanel>
      </div>

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
              Remove &quot;{deleteTarget?.questTitle}&quot; from history only if you
              want this completion record gone. The quest itself will remain.
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
