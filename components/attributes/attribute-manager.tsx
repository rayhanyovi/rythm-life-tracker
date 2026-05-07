"use client";

import {
  type DragEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAutoSelect } from "@/hooks/use-auto-select";
import { useMutation } from "@/hooks/use-mutation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  Loader2,
  PencilLine,
  Plus,
  RotateCw,
  Trash2,
  X,
} from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { DEFAULT_ATTRIBUTE_NAMES } from "@/lib/attribute-defaults";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryColor } from "@/lib/category-colors";
import { cn } from "@/lib/utils";

type AttributeRecord = {
  id: string;
  name: string;
  sortOrder: number;
};

type AttributesPayload = {
  attribute?: AttributeRecord;
  attributes?: AttributeRecord[];
  createdNames?: string[];
  error?: string;
};

type DragState = {
  id: string;
  mode: "native" | "pointer";
  overId: string | null;
};

async function readPayload(response: Response) {
  try {
    return (await response.json()) as AttributesPayload;
  } catch {
    return null;
  }
}

export function AttributeManager() {
  const [attributes, setAttributes] = useState<AttributeRecord[]>([]);
  const [newAttributeName, setNewAttributeName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttributeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const { errorMessage, statusMessage, isPending, runMutation, setError, setStatus } =
    useMutation();
  const dragOverIdRef = useRef<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const pointerDraggingRef = useRef(false);

  const clearLongPressTimer = () => {
    if (!longPressTimerRef.current) {
      return;
    }

    window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const loadAttributes = async () => {
    setError(null);

    const response = await fetch("/api/attributes", {
      cache: "no-store",
    });
    const payload = await readPayload(response);

    if (!response.ok || !payload?.attributes) {
      throw new Error(payload?.error ?? "Failed to load attributes.");
    }

    setAttributes(payload.attributes);
  };

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await loadAttributes();
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load attributes.",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAttribute = useAutoSelect(
    attributes,
    selectedAttributeId,
    setSelectedAttributeId,
  );

  const persistAttributeOrder = (
    reordered: AttributeRecord[],
    message = "Attribute order updated.",
  ) => {
    runMutation(async () => {
      const response = await fetch("/api/attributes/reorder", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          attributeIds: reordered.map((attribute) => attribute.id),
        }),
      });
      const payload = await readPayload(response);

      if (!response.ok || !payload?.attributes) {
        throw new Error(payload?.error ?? "Failed to reorder attributes.");
      }

      setAttributes(payload.attributes);
      setStatus(message);
    });
  };

  const reorderByTarget = (sourceId: string, targetId: string | null) => {
    if (!targetId || sourceId === targetId) {
      return;
    }

    const sourceIndex = attributes.findIndex((attribute) => attribute.id === sourceId);
    const targetIndex = attributes.findIndex((attribute) => attribute.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const reordered = [...attributes];
    const [movedAttribute] = reordered.splice(sourceIndex, 1);

    reordered.splice(targetIndex, 0, movedAttribute);
    persistAttributeOrder(reordered, `Moved "${movedAttribute.name}".`);
  };

  const handleCreate = () => {
    const trimmedName = newAttributeName.trim();

    if (!trimmedName) {
      setError("Attribute name is required.");
      return;
    }

    runMutation(async () => {
      const response = await fetch("/api/attributes", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });
      const payload = await readPayload(response);

      if (!response.ok || !payload?.attribute) {
        throw new Error(payload?.error ?? "Failed to create attribute.");
      }

      setNewAttributeName("");
      setSelectedAttributeId(payload.attribute.id);
      setStatus(`Created "${trimmedName}".`);
      await loadAttributes();
    });
  };

  const handleRename = (attributeId: string) => {
    const trimmedName = editingName.trim();

    if (!trimmedName) {
      setError("Attribute name is required.");
      return;
    }

    runMutation(async () => {
      const response = await fetch(`/api/attributes/${attributeId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });
      const payload = await readPayload(response);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to rename attribute.");
      }

      setEditingId(null);
      setEditingName("");
      setStatus(`Renamed attribute to "${trimmedName}".`);
      await loadAttributes();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    runMutation(async () => {
      const response = await fetch(`/api/attributes/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const payload = await readPayload(response);

      if (!response.ok && response.status !== 204) {
        throw new Error(payload?.error ?? "Failed to delete attribute.");
      }

      setStatus(`Deleted "${deleteTarget.name}".`);
      setDeleteTarget(null);

      if (selectedAttributeId === deleteTarget.id) {
        setSelectedAttributeId(null);
      }

      await loadAttributes();
    });
  };

  const handleMove = (attributeId: string, direction: "up" | "down") => {
    const currentIndex = attributes.findIndex((attribute) => attribute.id === attributeId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= attributes.length) {
      return;
    }

    const reordered = [...attributes];
    const [movedAttribute] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, movedAttribute);

    persistAttributeOrder(reordered);
  };

  const handleNativeDragStart = (
    event: DragEvent<HTMLButtonElement>,
    attributeId: string,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", attributeId);
    dragOverIdRef.current = attributeId;
    setDragState({ id: attributeId, mode: "native", overId: attributeId });
  };

  const handleNativeDrop = (
    event: DragEvent<HTMLElement>,
    targetId: string,
  ) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || dragState?.id;

    setDragState(null);
    dragOverIdRef.current = null;

    if (sourceId) {
      reorderByTarget(sourceId, targetId);
    }
  };

  const handlePointerDragStart = (
    event: PointerEvent<HTMLButtonElement>,
    attributeId: string,
  ) => {
    if (event.pointerType === "mouse" || isPending) {
      return;
    }

    const pointerId = event.pointerId;

    pointerDraggingRef.current = false;
    dragOverIdRef.current = attributeId;
    clearLongPressTimer();

    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      if (moveEvent.pointerId !== pointerId || !pointerDraggingRef.current) {
        return;
      }

      moveEvent.preventDefault();

      const target = document
        .elementFromPoint(moveEvent.clientX, moveEvent.clientY)
        ?.closest<HTMLElement>("[data-attribute-id]");
      const overId = target?.dataset.attributeId ?? attributeId;

      dragOverIdRef.current = overId;
      setDragState({ id: attributeId, mode: "pointer", overId });
    };

    const finishPointerDrag = (cancelled = false) => {
      clearLongPressTimer();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);

      const overId = dragOverIdRef.current;
      const wasDragging = pointerDraggingRef.current;

      pointerDraggingRef.current = false;
      dragOverIdRef.current = null;
      setDragState(null);

      if (!cancelled && wasDragging) {
        reorderByTarget(attributeId, overId);
      }
    };

    const handlePointerUp = (upEvent: globalThis.PointerEvent) => {
      if (upEvent.pointerId === pointerId) {
        finishPointerDrag(false);
      }
    };

    const handlePointerCancel = (cancelEvent: globalThis.PointerEvent) => {
      if (cancelEvent.pointerId === pointerId) {
        finishPointerDrag(true);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    longPressTimerRef.current = window.setTimeout(() => {
      pointerDraggingRef.current = true;
      setDragState({ id: attributeId, mode: "pointer", overId: attributeId });
    }, 280);
  };

  const handleSeedDefaults = () => {
    runMutation(async () => {
      const response = await fetch("/api/bootstrap/default-attributes", {
        method: "POST",
      });
      const payload = await readPayload(response);

      if (!response.ok || !payload?.attributes) {
        throw new Error(payload?.error ?? "Failed to seed starter pack.");
      }

      setAttributes(payload.attributes);
      setStatus(
        payload.createdNames?.length
          ? `Added ${payload.createdNames.length} starter attributes.`
          : "Starter attributes are already available.",
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
                  Attributes
                </h1>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {isLoading
                    ? "loading attributes"
                    : `${attributes.length} attributes | Starter pack: ${DEFAULT_ATTRIBUTE_NAMES.length} options | selected ${selectedAttribute?.name ?? "none"}`}
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
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RotateCw className="size-4" />
                )}
                Seed
              </Button>
            </div>

            <div className="grid gap-2 border-t border-border px-5 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
              <Input
                value={newAttributeName}
                onChange={(event) => setNewAttributeName(event.target.value)}
                placeholder="Add a new attribute"
                disabled={isPending}
                className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleCreate();
                  }
                }}
              />
              <Button size="sm" onClick={handleCreate} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Add attribute
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden xl:inline-flex"
                aria-label="Seed default attributes"
                onClick={handleSeedDefaults}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RotateCw className="size-4" />
                )}
                Seed defaults
              </Button>
            </div>
          </section>

          {errorMessage ? (
            <div className="px-5 pt-4">
              <Alert variant="destructive">
                <X className="size-4" />
                <AlertTitle>Attribute update failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          {statusMessage ? (
            <div className="px-5 pt-4">
              <Alert>
                <Check className="size-4" />
                <AlertTitle>Saved</AlertTitle>
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>
            </div>
          ) : null}

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
          ) : attributes.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No attributes yet"
                description="Create your first attribute or seed the starter pack to get structure faster."
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
              {attributes.map((attribute, index) => {
                const isEditing = editingId === attribute.id;
                const selected = selectedAttribute?.id === attribute.id;
                const isDragged = dragState?.id === attribute.id;
                const isDragTarget = dragState?.overId === attribute.id;

                return (
                  <section
                    key={attribute.id}
                    data-attribute-id={attribute.id}
                    onDragOver={(event) => {
                      if (!dragState) {
                        return;
                      }

                      event.preventDefault();
                      dragOverIdRef.current = attribute.id;
                      setDragState((current) =>
                        current ? { ...current, overId: attribute.id } : current,
                      );
                    }}
                    onDrop={(event) => handleNativeDrop(event, attribute.id)}
                    className={cn(
                      "border-b border-border transition-colors duration-[160ms] ease-out",
                      selected ? "bg-accent" : "bg-card hover:bg-muted/35",
                      isDragged && "opacity-60",
                      isDragTarget && dragState?.id !== attribute.id && "bg-muted",
                    )}
                  >
                    <div className="grid gap-3 px-5 py-2.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          draggable={!isPending}
                          onDragStart={(event) =>
                            handleNativeDragStart(event, attribute.id)
                          }
                          onDragEnd={() => {
                            dragOverIdRef.current = null;
                            setDragState(null);
                          }}
                          onPointerDown={(event) =>
                            handlePointerDragStart(event, attribute.id)
                          }
                          disabled={isPending}
                          className="size-8 cursor-grab text-muted-foreground active:cursor-grabbing"
                        >
                          <GripVertical className="size-4" />
                          <span className="sr-only">Reorder {attribute.name}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleMove(attribute.id, "up")}
                          disabled={isPending || index === 0}
                          className="size-8"
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleMove(attribute.id, "down")}
                          disabled={isPending || index === attributes.length - 1}
                          className="size-8"
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                      </div>

                      {isEditing ? (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Input
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                            disabled={isPending}
                            className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                handleRename(attribute.id);
                              }

                              if (event.key === "Escape") {
                                setEditingId(null);
                                setEditingName("");
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleRename(attribute.id)}
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
                        <button
                          type="button"
                          onClick={() => setSelectedAttributeId(attribute.id)}
                          className="min-w-0 text-left"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="size-2 shrink-0 rounded-full"
                              style={{
                                backgroundColor: getCategoryColor(attribute.name),
                              }}
                            />
                            <p className="truncate text-[13px] font-medium leading-5 text-foreground">
                              {attribute.name}
                            </p>
                          </div>
                          <p className="mt-1 font-mono text-[10px] leading-5 text-muted-foreground">
                            Order {index + 1} in the Tasks workspace
                          </p>
                        </button>
                      )}

                      {!isEditing ? (
                        <div className="flex items-center gap-1.5 sm:justify-self-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs"
                            onClick={() => {
                              setEditingId(attribute.id);
                              setEditingName(attribute.name);
                            }}
                            disabled={isPending}
                          >
                            <PencilLine className="size-4" />
                            Rename
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteTarget(attribute)}
                            disabled={isPending}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        <aside className="hidden bg-background xl:block xl:h-screen xl:overflow-y-auto">
          <div className="space-y-6 p-5">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Selected attribute
              </p>
              <div className="mt-4 space-y-2">
                <h2 className="inline-flex items-center gap-2 text-[15px] font-semibold leading-6 tracking-tight text-foreground">
                  {selectedAttribute ? (
                    <span
                      className="size-2 rounded-full"
                      style={{
                        backgroundColor: getCategoryColor(selectedAttribute.name),
                      }}
                    />
                  ) : null}
                  {selectedAttribute?.name ?? "No attribute selected"}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Attributes are RPG-style life-domain containers. Assign tasks to an
                  attribute to track progress across Health, Career, Finance, and more.
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
                {DEFAULT_ATTRIBUTE_NAMES.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 border-b border-border py-2 text-sm text-foreground last:border-b-0"
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: getCategoryColor(name) }}
                    />
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
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RotateCw className="size-4" />
                )}
                Seed starter pack
              </Button>
            </div>
          </div>
        </aside>
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
            <AlertDialogTitle>Delete attribute</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteTarget?.name}&quot; only if no task still depends on it.
              The API will block this action while tasks still point to the attribute.
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
