import {
  type Attribute,
  TaskCadence,
  TaskKind,
  type Task,
  type TaskCompletion,
} from "@prisma/client";

import { getCurrentPeriodKey, getLocalDateKey } from "@/lib/periods";
import { calculateCurrentStreak } from "@/lib/streaks";

type DashboardTaskRecord = Task & {
  attribute: Attribute;
};

/** For TODOs (cadence=null), use ONCE for completion lookups */
function getEffectiveCadence(task: Task): TaskCadence {
  return task.cadence ?? TaskCadence.ONCE;
}

export function mapDashboardAttributes(
  tasks: DashboardTaskRecord[],
  currentCompletions: TaskCompletion[],
  recentCompletions: TaskCompletion[],
  date = new Date(),
) {
  const currentCompletionByTaskId = new Map(
    currentCompletions.map((completion) => [completion.taskId, completion]),
  );
  const completionPeriodKeysByTaskId = new Map<string, string[]>();

  for (const completion of recentCompletions) {
    const nextKeys = completionPeriodKeysByTaskId.get(completion.taskId) ?? [];
    nextKeys.push(completion.periodKey);
    completionPeriodKeysByTaskId.set(completion.taskId, nextKeys);
  }

  const attributes = new Map<
    string,
    {
      attributeId: string;
      attributeName: string;
      items: Array<{
        attributeId: string;
        attributeName: string;
        cadence: TaskCadence | null;
        completionId: string | null;
        currentPeriodKey: string;
        description: string | null;
        dueDate: string | null;
        isActive: boolean;
        isCompletedNow: boolean;
        note: string | null;
        streak: number | null;
        taskId: string;
        taskKind: TaskKind;
        title: string;
      }>;
      sortOrder: number;
    }
  >();

  for (const task of tasks) {
    const effectiveCadence = getEffectiveCadence(task);
    const currentPeriodKey = getCurrentPeriodKey(effectiveCadence, date);
    const currentCompletion = currentCompletionByTaskId.get(task.id) ?? null;
    const completionKeys = completionPeriodKeysByTaskId.get(task.id) ?? [];
    const attributeEntry = attributes.get(task.attributeId) ?? {
      attributeId: task.attributeId,
      attributeName: task.attribute.name,
      items: [],
      sortOrder: task.attribute.sortOrder,
    };

    attributeEntry.items.push({
      taskId: task.id,
      attributeId: task.attributeId,
      attributeName: task.attribute.name,
      taskKind: task.taskKind,
      cadence: task.cadence,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      title: task.title,
      description: task.description,
      isActive: task.isActive,
      isCompletedNow: Boolean(currentCompletion),
      currentPeriodKey,
      streak: calculateCurrentStreak(effectiveCadence, completionKeys, date),
      completionId: currentCompletion?.id ?? null,
      note: currentCompletion?.note ?? null,
    });

    attributes.set(task.attributeId, attributeEntry);
  }

  return {
    date: getLocalDateKey(date),
    attributes: [...attributes.values()]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((attribute) => ({
        attributeId: attribute.attributeId,
        attributeName: attribute.attributeName,
        items: attribute.items,
      })),
  };
}
