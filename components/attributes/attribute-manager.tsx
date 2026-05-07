"use client";

import { useEffect, useRef, useState } from "react";
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
import { DEFAULT_ATTRIBUTE_NAMES } from "@/lib/attribute-defaults";
import { getCategoryColor } from "@/lib/category-colors";

import {
  type AttributeRecord,
  AttributeListItem,
} from "@/components/attributes/attribute-list-item";

type AttributesPayload = {
  attribute?: AttributeRecord;
  attributes?: AttributeRecord[];
  createdNames?: string[];
  error?: string;
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
  const { errorMessage, statusMessage, isPending, runMutation, setError, setStatus } =
    useMutation();

  // We keep a ref to loadAttributes so it can be called from handlers
  const loadAttributesRef = useRef<(() => Promise<void>) | null>(null);

  const loadAttributes = async () => {
    setError(null);
    const response = await fetch("/api/attributes", { cache: "no-store" });
    const payload = await readPayload(response);

    if (!response.ok || !payload?.attributes) {
      throw new Error(payload?.error ?? "Failed to load attributes.");
    }

    setAttributes(payload.attributes);
  };

  loadAttributesRef.current = loadAttributes;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await loadAttributes();
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Failed to load attributes.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAttribute = useAutoSelect(attributes, selectedAttributeId, setSelectedAttributeId);

  const persistOrder = (reordered: AttributeRecord[], message = "Attribute order updated.") => {
    runMutation(async () => {
      const response = await fetch("/api/attributes/reorder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attributeIds: reordered.map((a) => a.id) }),
      });
      const payload = await readPayload(response);

      if (!response.ok || !payload?.attributes) {
        throw new Error(payload?.error ?? "Failed to reorder attributes.");
      }

      setAttributes(payload.attributes);
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
  } = useReorderList(attributes, (reordered) => {
    const moved = reordered.find((a, i) => a.id !== attributes[i]?.id);
    persistOrder(reordered, moved ? `Moved "${moved.name}".` : "Attribute order updated.");
  }, isPending);

  const handleMove = (attributeId: string, direction: "up" | "down") => {
    const currentIndex = attributes.findIndex((a) => a.id === attributeId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= attributes.length) return;

    const reordered = [...attributes];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    persistOrder(reordered);
  };

  const handleCreate = () => {
    const trimmedName = newAttributeName.trim();

    if (!trimmedName) { setError("Attribute name is required."); return; }

    runMutation(async () => {
      const response = await fetch("/api/attributes", {
        method: "POST",
        headers: { "content-type": "application/json" },
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

    if (!trimmedName) { setError("Attribute name is required."); return; }

    runMutation(async () => {
      const response = await fetch(`/api/attributes/${attributeId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
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
    if (!deleteTarget) return;

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

      if (selectedAttributeId === deleteTarget.id) setSelectedAttributeId(null);

      await loadAttributes();
    });
  };

  const handleSeedDefaults = () => {
    runMutation(async () => {
      const response = await fetch("/api/bootstrap/default-attributes", { method: "POST" });
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
          {/* Header */}
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
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCw className="size-4" />}
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
                onKeyDown={(event) => { if (event.key === "Enter") handleCreate(); }}
              />
              <Button size="sm" onClick={handleCreate} disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
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
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCw className="size-4" />}
                Seed defaults
              </Button>
            </div>
          </section>

          {errorMessage ? (
            <ManagerErrorAlert message={errorMessage} title="Attribute update failed" />
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
              {attributes.map((attribute, index) => (
                <AttributeListItem
                  key={attribute.id}
                  attribute={attribute}
                  dragState={dragState}
                  editingName={editingName}
                  index={index}
                  isEditing={editingId === attribute.id}
                  isPending={isPending}
                  selected={selectedAttribute?.id === attribute.id}
                  totalCount={attributes.length}
                  onCancelEdit={() => { setEditingId(null); setEditingName(""); }}
                  onDelete={() => setDeleteTarget(attribute)}
                  onDragEnd={handleNativeDragEnd}
                  onDragOver={(event) => handleNativeDragOver(event, attribute.id)}
                  onDragStart={(event) => handleNativeDragStart(event, attribute.id)}
                  onDrop={(event) => handleNativeDrop(event, attribute.id)}
                  onEditNameChange={setEditingName}
                  onEditStart={() => { setEditingId(attribute.id); setEditingName(attribute.name); }}
                  onMoveDown={() => handleMove(attribute.id, "down")}
                  onMoveUp={() => handleMove(attribute.id, "up")}
                  onPointerDown={(event) => handlePointerDragStart(event, attribute.id)}
                  onRename={() => handleRename(attribute.id)}
                  onSelect={() => setSelectedAttributeId(attribute.id)}
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
                Selected attribute
              </p>
              <div className="mt-4 space-y-2">
                <h2 className="inline-flex items-center gap-2 text-[15px] font-semibold leading-6 tracking-tight text-foreground">
                  {selectedAttribute ? (
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(selectedAttribute.name) }}
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
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
