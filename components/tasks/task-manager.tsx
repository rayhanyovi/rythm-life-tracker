"use client";

import Link from "next/link";
import { Loader2, Search, Trash2 } from "lucide-react";
import { Plus } from "lucide-react";

import { useTaskManager } from "@/hooks/use-task-manager";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ManagerErrorAlert } from "@/components/ui/manager-alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskDetailPane } from "@/components/tasks/task-detail-pane";
import { TaskFormSheet } from "@/components/tasks/task-form-sheet";
import { TaskListSection } from "@/components/tasks/task-list-section";
import { TASK_KIND_LABELS, TASK_KINDS } from "@/components/tasks/task-types";

const ALL_ATTRIBUTE_VALUE = "__all__";
const ALL_KIND_VALUE = "__all__";

export function TaskManager() {
  const {
    attributes,
    deleteTarget,
    errorMessage,
    formError,
    formMode,
    formState,
    groupedTasks,
    hasActiveFilters,
    hasNoAttributes,
    hasNoVisibleTasks,
    includeInactive,
    isLoadingAttributes,
    isLoadingTasks,
    isPending,
    isMobileDetailOpen,
    searchInput,
    selectedAttributeId,
    selectedTask,
    selectedTaskKind,
    setDeleteTarget,
    setFormState,
    setIncludeInactive,
    setIsMobileDetailOpen,
    setSearchInput,
    setSelectedAttributeId,
    setSelectedTaskId,
    setSelectedTaskKind,
    stats,
    closeForm,
    handleDelete,
    handleSaveTask,
    handleToggleActive,
    openCreateForm,
    openEditForm,
  } = useTaskManager();

  return (
    <>
      <div className="min-h-[calc(100vh-4.25rem)] bg-card lg:h-screen lg:min-h-0 xl:grid xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 border-border bg-card xl:h-screen xl:overflow-y-auto xl:border-r">
          {/* Header */}
          <section className="border-b border-border bg-card lg:sticky lg:top-0 lg:z-10">
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-[22px] font-semibold leading-7 tracking-tight text-foreground">
                  Lists
                </h1>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {isLoadingTasks
                    ? "loading task library"
                    : `${stats.visible} visible | ${stats.active} active | ${stats.inactive} inactive`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={openCreateForm}
                  disabled={isPending || hasNoAttributes}
                >
                  <Plus className="size-4" />
                  Add task
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/attributes">Open Attributes</Link>
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid gap-2 border-t border-border px-5 py-3 md:grid-cols-[minmax(0,1fr)_13rem_11rem] md:items-center">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search tasks by title or description"
                  className="h-9 rounded-lg bg-background px-3 py-2 pl-9 text-sm shadow-none"
                />
              </div>
              <Select
                value={selectedAttributeId ?? ALL_ATTRIBUTE_VALUE}
                onValueChange={(value) =>
                  setSelectedAttributeId(value === ALL_ATTRIBUTE_VALUE ? null : value)
                }
                disabled={isPending || isLoadingAttributes}
              >
                <SelectTrigger
                  aria-label="Filter tasks by attribute"
                  className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                >
                  <SelectValue placeholder="All attributes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ATTRIBUTE_VALUE}>All attributes</SelectItem>
                  {attributes.map((attribute) => (
                    <SelectItem key={attribute.id} value={attribute.id}>
                      {attribute.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedTaskKind ?? ALL_KIND_VALUE}
                onValueChange={(value) =>
                  setSelectedTaskKind(value === ALL_KIND_VALUE ? null : (value as typeof selectedTaskKind))
                }
                disabled={isPending}
              >
                <SelectTrigger
                  aria-label="Filter tasks by type"
                  className="h-9 rounded-lg bg-background px-3 py-2 text-sm shadow-none"
                >
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_KIND_VALUE}>All types</SelectItem>
                  {TASK_KINDS.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {TASK_KIND_LABELS[kind]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 border-t border-border px-5 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <label className="flex min-h-9 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-none">
                <Checkbox
                  checked={includeInactive}
                  onCheckedChange={(checked) => setIncludeInactive(checked === true)}
                  disabled={isPending}
                />
                <span className="font-medium text-foreground">Show inactive tasks</span>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setSelectedAttributeId(null);
                  setSelectedTaskKind(null);
                  setIncludeInactive(false);
                }}
                disabled={!hasActiveFilters || isPending}
              >
                Reset filters
              </Button>
            </div>
          </section>

          {errorMessage ? (
            <ManagerErrorAlert message={errorMessage} title="Lists update failed" />
          ) : null}

          <TaskListSection
            groupedTasks={groupedTasks}
            hasNoAttributes={hasNoAttributes}
            hasNoVisibleTasks={hasNoVisibleTasks}
            isLoading={isLoadingAttributes || isLoadingTasks}
            onEdit={openEditForm}
            onMobileSelect={(id) => {
              setSelectedTaskId(id);
              setIsMobileDetailOpen(true);
            }}
            onSelect={setSelectedTaskId}
            openCreateForm={openCreateForm}
            selectedTask={selectedTask}
          />
        </div>

        <TaskDetailPane
          isPending={isPending}
          isMobileDetailOpen={isMobileDetailOpen}
          onDelete={() => selectedTask && setDeleteTarget(selectedTask)}
          onEdit={() => selectedTask && openEditForm(selectedTask)}
          onMobileClose={setIsMobileDetailOpen}
          onToggleActive={() => selectedTask && handleToggleActive(selectedTask)}
          selectedTask={selectedTask}
        />
      </div>

      <TaskFormSheet
        attributes={attributes}
        formError={formError}
        formMode={formMode}
        formState={formState}
        hasNoAttributes={hasNoAttributes}
        isPending={isPending}
        onClose={closeForm}
        onSave={handleSaveTask}
        setFormState={setFormState}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteTarget?.title}&quot; only if you accept losing the
              linked Activity Log entries as well. This action cannot be undone.
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
