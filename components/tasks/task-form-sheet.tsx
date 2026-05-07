"use client";

import { CircleAlert, Loader2, PencilLine, Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  type AttributeRecord,
  type TaskCadence,
  type TaskFormState,
  type TaskKind,
  CADENCE_LABELS,
  TASK_CADENCES,
  TASK_KIND_LABELS,
  TASK_KINDS,
} from "@/components/tasks/task-types";

function TaskFormFields({
  attributes,
  formError,
  formState,
  isPending,
  onChange,
}: {
  attributes: AttributeRecord[];
  formError: string | null;
  formState: TaskFormState;
  isPending: boolean;
  onChange: (updater: (current: TaskFormState) => TaskFormState) => void;
}) {
  return (
    <div className="space-y-5">
      {formError ? (
        <Alert variant="destructive">
          <CircleAlert className="size-4" />
          <AlertTitle>Could not save task</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-1.5">
        <Label
          htmlFor="list-task-title"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Title
        </Label>
        <Input
          id="list-task-title"
          value={formState.title}
          onChange={(event) =>
            onChange((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Morning review, QA pass, Read 10 pages"
          disabled={isPending}
          className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="list-task-description"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Description
        </Label>
        <Textarea
          id="list-task-description"
          value={formState.description}
          onChange={(event) =>
            onChange((current) => ({ ...current, description: event.target.value }))
          }
          placeholder="Optional context for this task."
          disabled={isPending}
          className="min-h-28 resize-none rounded-lg bg-background text-sm shadow-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="list-task-attribute"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Attribute
        </Label>
        <Select
          value={formState.attributeId}
          onValueChange={(value) =>
            onChange((current) => ({ ...current, attributeId: value }))
          }
          disabled={isPending || attributes.length === 0}
        >
          <SelectTrigger
            id="list-task-attribute"
            className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
          >
            <SelectValue placeholder="Choose an attribute" />
          </SelectTrigger>
          <SelectContent>
            {attributes.map((attribute) => (
              <SelectItem key={attribute.id} value={attribute.id}>
                {attribute.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="list-task-kind"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Task type
        </Label>
        <Select
          value={formState.taskKind}
          onValueChange={(value) =>
            onChange((current) => ({
              ...current,
              taskKind: value as TaskKind,
              cadence: value === "RECURRING" ? (current.cadence || "DAILY") : "",
              dueDate: value === "TODO" ? current.dueDate : "",
            }))
          }
          disabled={isPending}
        >
          <SelectTrigger
            id="list-task-kind"
            className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
          >
            <SelectValue placeholder="Choose a type" />
          </SelectTrigger>
          <SelectContent>
            {TASK_KINDS.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {TASK_KIND_LABELS[kind]}
              </SelectItem>
            ))}
            <SelectItem value="HABIT" disabled>
              Habit (coming soon)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formState.taskKind === "RECURRING" ? (
        <div className="space-y-1.5">
          <Label
            htmlFor="list-task-cadence"
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
          >
            Cadence
          </Label>
          <Select
            value={formState.cadence}
            onValueChange={(value) =>
              onChange((current) => ({ ...current, cadence: value as TaskCadence }))
            }
            disabled={isPending}
          >
            <SelectTrigger
              id="list-task-cadence"
              className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
            >
              <SelectValue placeholder="Choose a recurrence" />
            </SelectTrigger>
            <SelectContent>
              {TASK_CADENCES.map((cadence) => (
                <SelectItem key={cadence} value={cadence}>
                  {CADENCE_LABELS[cadence]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {formState.taskKind === "TODO" ? (
        <div className="space-y-1.5">
          <Label
            htmlFor="list-task-due-date"
            className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
          >
            Due date{" "}
            <span className="normal-case tracking-normal text-muted-foreground/70">
              (optional)
            </span>
          </Label>
          <Input
            id="list-task-due-date"
            type="date"
            value={formState.dueDate}
            onChange={(event) =>
              onChange((current) => ({ ...current, dueDate: event.target.value }))
            }
            disabled={isPending}
            className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for backlog-only. Set a date to make it appear on Today when due.
          </p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Status
        </Label>
        <label className="flex min-h-10 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-none">
          <Checkbox
            checked={formState.isActive}
            onCheckedChange={(checked) =>
              onChange((current) => ({ ...current, isActive: checked === true }))
            }
            disabled={isPending}
          />
          <span className="font-medium text-foreground">Task is active</span>
        </label>
      </div>
    </div>
  );
}

export function TaskFormSheet({
  attributes,
  formError,
  formMode,
  formState,
  hasNoAttributes,
  isPending,
  onClose,
  onSave,
  setFormState,
}: {
  attributes: AttributeRecord[];
  formError: string | null;
  formMode: "create" | "edit" | null;
  formState: TaskFormState;
  hasNoAttributes: boolean;
  isPending: boolean;
  onClose: () => void;
  onSave: () => void;
  setFormState: Dispatch<SetStateAction<TaskFormState>>;
}) {
  return (
    <Sheet
      open={Boolean(formMode)}
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <SheetContent className="w-[92vw] max-w-xl gap-6">
        <SheetHeader>
          <SheetTitle>{formMode === "edit" ? "Edit task" : "Create task"}</SheetTitle>
          <SheetDescription>
            {formMode === "edit"
              ? "Update the task details below."
              : "Fill in the details for your new task. Type determines how it appears on Today."}
          </SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto pr-1">
          <TaskFormFields
            attributes={attributes}
            formError={formError}
            formState={formState}
            isPending={isPending}
            onChange={(updater) => setFormState((current) => updater(current))}
          />
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isPending || hasNoAttributes}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : formMode === "edit" ? (
              <PencilLine className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {formMode === "edit" ? "Save changes" : "Create task"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
