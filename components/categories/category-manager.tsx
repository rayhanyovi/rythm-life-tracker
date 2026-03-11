"use client";

import { useEffect, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Loader2,
  PencilLine,
  Plus,
  RotateCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { DetailPanel } from "@/components/app/detail-panel";
import { DEFAULT_CATEGORY_NAMES } from "@/lib/category-defaults";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CategoryRecord = {
  id: string;
  name: string;
  sortOrder: number;
};

type CategoriesPayload = {
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
  const [deleteTarget, setDeleteTarget] = useState<CategoryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadCategories = async () => {
    setErrorMessage(null);

    const response = await fetch("/api/categories", {
      cache: "no-store",
    });
    const payload = await readPayload(response);

    if (!response.ok || !payload?.categories) {
      throw new Error(payload?.error ?? "Failed to load categories.");
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
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load categories.",
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
  }, []);

  const runMutation = (action: () => Promise<void>) => {
    setErrorMessage(null);
    setStatusMessage(null);

    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      }
    });
  };

  const handleCreate = () => {
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      setErrorMessage("Category name is required.");
      return;
    }

    runMutation(async () => {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });
      const payload = await readPayload(response);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to create category.");
      }

      setNewCategoryName("");
      setStatusMessage(`Created "${trimmedName}".`);
      await loadCategories();
    });
  };

  const handleRename = (categoryId: string) => {
    const trimmedName = editingName.trim();

    if (!trimmedName) {
      setErrorMessage("Category name is required.");
      return;
    }

    runMutation(async () => {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });
      const payload = await readPayload(response);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to rename category.");
      }

      setEditingId(null);
      setEditingName("");
      setStatusMessage(`Renamed category to "${trimmedName}".`);
      await loadCategories();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    runMutation(async () => {
      const response = await fetch(`/api/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const payload = await readPayload(response);

      if (!response.ok && response.status !== 204) {
        throw new Error(payload?.error ?? "Failed to delete category.");
      }

      setStatusMessage(`Deleted "${deleteTarget.name}".`);
      setDeleteTarget(null);
      await loadCategories();
    });
  };

  const handleMove = (categoryId: string, direction: "up" | "down") => {
    const currentIndex = categories.findIndex((category) => category.id === categoryId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= categories.length) {
      return;
    }

    const reordered = [...categories];
    const [movedCategory] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, movedCategory);

    runMutation(async () => {
      const response = await fetch("/api/categories/reorder", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          categoryIds: reordered.map((category) => category.id),
        }),
      });
      const payload = await readPayload(response);

      if (!response.ok || !payload?.categories) {
        throw new Error(payload?.error ?? "Failed to reorder categories.");
      }

      setCategories(payload.categories);
      setStatusMessage("Category order updated.");
    });
  };

  const handleSeedDefaults = () => {
    runMutation(async () => {
      const response = await fetch("/api/bootstrap/default-categories", {
        method: "POST",
      });
      const payload = await readPayload(response);

      if (!response.ok || !payload?.categories) {
        throw new Error(payload?.error ?? "Failed to seed default categories.");
      }

      setCategories(payload.categories);
      setStatusMessage(
        payload.createdNames?.length
          ? `Added ${payload.createdNames.length} default categories.`
          : "Default categories are already available.",
      );
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader className="gap-3">
          <div className="space-y-1">
            <CardTitle>Life Areas</CardTitle>
            <CardDescription>
              Keep category management lightweight: create, rename, protect
              deletion, and adjust order as your rhythm changes.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Add a new life area"
              disabled={isPending}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleCreate();
                }
              }}
            />
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add category
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage ? (
            <Alert variant="destructive">
              <X className="size-4" />
              <AlertTitle>Could not update categories</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {statusMessage ? (
            <Alert>
              <Sparkles className="size-4" />
              <AlertTitle>Saved</AlertTitle>
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          ) : null}

          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center rounded-md border border-dashed border-border/70 bg-background/55">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-md border border-dashed border-border/70 bg-background/55 px-5 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No categories yet.</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Seed the defaults or create your first custom life area.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category, index) => {
                const isEditing = editingId === category.id;

                return (
                  <div
                    key={category.id}
                    className="grid gap-3 rounded-md border border-border/75 bg-background/80 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => handleMove(category.id, "up")}
                        disabled={isPending || index === 0}
                        className="rounded-full border border-border/80 p-2 transition-colors hover:bg-muted disabled:opacity-40"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(category.id, "down")}
                        disabled={isPending || index === categories.length - 1}
                        className="rounded-full border border-border/80 p-2 transition-colors hover:bg-muted disabled:opacity-40"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                    </div>

                    {isEditing ? (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          disabled={isPending}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleRename(category.id);
                            }

                            if (event.key === "Escape") {
                              setEditingId(null);
                              setEditingName("");
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRename(category.id)}
                            disabled={isPending}
                          >
                            <Check className="size-4" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditingName("");
                            }}
                            disabled={isPending}
                          >
                            <X className="size-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Position {index + 1} in your dashboard grouping.
                        </p>
                      </div>
                    )}

                    {!isEditing ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(category.id);
                            setEditingName(category.name);
                          }}
                          disabled={isPending}
                        >
                          <PencilLine className="size-4" />
                          Rename
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteTarget(category)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <DetailPanel
        title="Default Starter Pack"
        description="Use the default Wheel of Life groups if you want a quick structure before creating custom categories."
        sticky={false}
        className="h-fit"
        contentClassName="space-y-4"
      >
          <div className="grid gap-2">
            {DEFAULT_CATEGORY_NAMES.map((name) => (
              <div
                key={name}
                className="rounded-md border border-border/70 bg-background/75 px-4 py-3 text-sm"
              >
                {name}
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSeedDefaults}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCw className="size-4" />}
            Seed defaults
          </Button>
      </DetailPanel>

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
            <AlertDialogTitle>Delete category</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteTarget?.name}&quot; only if no quest still depends on
              it.
              The API will block this action whenever quests still point to the
              category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
