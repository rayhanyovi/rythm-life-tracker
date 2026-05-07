"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, RotateCw } from "lucide-react";

import { useAutoSelect } from "@/hooks/use-auto-select";
import { useMutation } from "@/hooks/use-mutation";
import { useReorderList } from "@/hooks/use-reorder-list";

import { EmptyState } from "@/components/app/empty-state";
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
import { ManagerErrorAlert, ManagerStatusAlert } from "@/components/ui/manager-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_CATEGORY_NAMES } from "@/lib/category-defaults";
import { getCategoryColor } from "@/lib/category-colors";

// Reuse AttributeListItem — CategoryRecord has the same shape as AttributeRecord.
import {
  type AttributeRecord as CategoryRecord,
  AttributeListItem,
} from "@/components/attributes/attribute-list-item";

type CategoriesPayload = {
  category?: CategoryRecord;
  categories?: CategoryRecord[];
  createdNames?: string[];
  error?: string;
};

async function readPayload(response: Response) {
  try {
    return (await response.json()) as CategoriesPayload;
  } catch {
    return null;
  }
}

export function CategoryManager() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { errorMessage, statusMessage, isPending, runMutation, setError, setStatus } =
    useMutation();

  const loadCategories = async () => {
    setError(null);
    const response = await fetch("/api/categories", { cache: "no-store" });
    const payload = await readPayload(response);

    if (!response.ok || !payload?.categories) {
      throw new Error(payload?.error ?? "Failed to load habit lists.");
    }

    setCategories(payload.categories);
  };

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await loadCategories();
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Failed to load habit lists.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCategory = useAutoSelect(categories, selectedCategoryId, setSelectedCategoryId);

  const persistOrder = (reordered: CategoryRecord[], message = "List order updated.") => {
    runMutation(async () => {
      const response = await fetch("/api/categories/reorder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ categoryIds: reordered.map((c) => c.id) }),
      });
      const payload = await readPayload(response);

      if (!response.ok || !payload?.categories) {
        throw new Error(payload?.error ?? "Failed to reorder habit lists.");
      }

      setCategories(payload.categories);
      setStatus(message);
    });
  };

  const {
    dragState,
    handleNativeDragEnd,
    handleNativeDragOver,
    handleNativeDragStart,
    handleNativeDrop,
    handlePointerDragStart,
  } = useReorderList(categories, (reordered) => {
    const moved = reordered.find((c, i) => c.id !== categories[i]?.id);
    persistOrder(reordered, moved ? `Moved "${moved.name}".` : "List order updated.");
  }, isPending);

  const handleMove = (categoryId: string, direction: "up" | "down") => {
    const currentIndex = categories.findIndex((c) => c.id === categoryId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    persistOrder(reordered);
  };

  const handleCreate = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) { setError("List name is required."); return; }

    runMutation(async () => {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const payload = await readPayload(response);

      if (!response.ok || !payload?.category) {
        throw new Error(payload?.error ?? "Failed to create habit list.");
      }

      setNewCategoryName("");
      setSelectedCategoryId(payload.category.id);
      setStatus(`Created "${trimmedName}".`);
      await loadCategories();
    });
  };

  const handleRename = (categoryId: string) => {
    const trimmedName = editingName.trim();
    if (!trimmedName) { setError("List name is required."); return; }

    runMutation(async () => {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const payload = await readPayload(response);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to rename habit list.");
      }

      setEditingId(null);
      setEditingName("");
      setStatus(`Renamed list to "${trimmedName}".`);
      await loadCategories();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    runMutation(async () => {
      const response = await fetch(`/api/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const payload = await readPayload(response);

      if (!response.ok && response.status !== 204) {
        throw new Error(payload?.error ?? "Failed to delete habit list.");
      }

      setStatus(`Deleted "${deleteTarget.name}".`);
      setDeleteTarget(null);

      if (selectedCategoryId === deleteTarget.id) setSelectedCategoryId(null);

      await loadCategories();
    });
  };

  const handleSeedDefaults = () => {
    runMutation(async () => {
      const response = await fetch("/api/bootstrap/default-categories", { method: "POST" });
      const payload = await readPayload(response);

      if (!response.ok || !payload?.categories) {
        throw new Error(payload?.error ?? "Failed to seed starter pack.");
      }

      setCategories(payload.categories);
      setStatus(
        payload.createdNames?.length
          ? `Added ${payload.createdNames.length} starter lists.`
          : "Starter lists are already available.",
      );
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
                  Habit Lists
                </h1>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {isLoading
                    ? "loading habit lists"
                    : `${categories.length} lists | Starter pack: ${DEFAULT_CATEGORY_NAMES.length} options | selected ${selectedCategory?.name ?? "none"}`}
                </p>
              </div>
              <Button
                aria-label="Seed starter pack"
                size="sm"
                variant="outline"
                className="w-fit xl:hidden"
                onClick={handleSeedDefaults}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCw className="size-4" />}
                Seed
              </Button>
            </div>

            <div className="grid gap-2 border-t border-border px-5 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
              <Input
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="Add a new habit list"
                disabled={isPending}
                className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                onKeyDown={(event) => { if (event.key === "Enter") handleCreate(); }}
              />
              <Button size="sm" onClick={handleCreate} disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Add list
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden xl:inline-flex"
                aria-label="Seed default lists"
                onClick={handleSeedDefaults}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCw className="size-4" />}
                Seed defaults
              </Button>
            </div>
          </section>

          {errorMessage ? (
            <ManagerErrorAlert message={errorMessage} title="Habit List update failed" />
          ) : null}
          {statusMessage ? <ManagerStatusAlert message={statusMessage} /> : null}

          {isLoading ? (
            <div className="py-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <section key={index}>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-3">
                    <Skeleton className="size-8 rounded-sm" />
                    <div className="space-y-2">
                      <Skeleton className="h-3.5 w-36 rounded-sm" />
                      <Skeleton className="h-3 w-24 rounded-sm" />
                    </div>
                    <Skeleton className="h-3 w-20 rounded-sm" />
                  </div>
                </section>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No habit lists yet"
                description="Create your first list or seed the starter pack to get structure faster."
                action={
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleSeedDefaults}>
                      <RotateCw className="size-4" />
                      Seed starter pack
                    </Button>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="pb-5">
              {categories.map((category, index) => (
                <AttributeListItem
                  key={category.id}
                  attribute={category}
                  dragState={dragState}
                  editingName={editingName}
                  index={index}
                  isEditing={editingId === category.id}
                  isPending={isPending}
                  selected={selectedCategory?.id === category.id}
                  totalCount={categories.length}
                  onCancelEdit={() => { setEditingId(null); setEditingName(""); }}
                  onDelete={() => setDeleteTarget(category)}
                  onDragEnd={handleNativeDragEnd}
                  onDragOver={(event) => handleNativeDragOver(event, category.id)}
                  onDragStart={(event) => handleNativeDragStart(event, category.id)}
                  onDrop={(event) => handleNativeDrop(event, category.id)}
                  onEditNameChange={setEditingName}
                  onEditStart={() => { setEditingId(category.id); setEditingName(category.name); }}
                  onMoveDown={() => handleMove(category.id, "down")}
                  onMoveUp={() => handleMove(category.id, "up")}
                  onPointerDown={(event) => handlePointerDragStart(event, category.id)}
                  onRename={() => handleRename(category.id)}
                  onSelect={() => setSelectedCategoryId(category.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop side panel */}
        <aside className="hidden bg-background xl:block xl:h-screen xl:overflow-y-auto">
          <div className="space-y-6 p-5">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Selected list
              </p>
              <div className="mt-4 space-y-2">
                <h2 className="inline-flex items-center gap-2 text-[15px] font-semibold leading-6 tracking-tight text-foreground">
                  {selectedCategory ? (
                    <span className="size-2 rounded-full" style={{ backgroundColor: getCategoryColor(selectedCategory.name) }} />
                  ) : null}
                  {selectedCategory?.name ?? "No list selected"}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Habit Lists group recurring tasks. Use them to organise tasks by life area, project, or cadence.
                </p>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Starter pack
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use the default set if you want a faster initial structure.
              </p>
              <div className="mt-4 grid gap-2">
                {DEFAULT_CATEGORY_NAMES.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 border-b border-border py-2 text-sm text-foreground last:border-b-0"
                  >
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(name) }} />
                    {name}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={handleSeedDefaults}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCw className="size-4" />}
                Seed starter pack
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete habit list</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteTarget?.name}&quot; only if no task still belongs to it. The API will block this action while tasks still reference the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
