export type TaskKind = "RECURRING" | "TODO" | "HABIT";
export type TaskCadence = "DAILY" | "WEEKLY" | "MONTHLY";

export type AttributeRecord = {
  id: string;
  name: string;
  sortOrder: number;
};

export type TaskRecord = {
  id: string;
  attributeId: string;
  title: string;
  description: string | null;
  taskKind: TaskKind;
  cadence: TaskCadence | null;
  dueDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  attribute: AttributeRecord;
};

export type TasksPayload = {
  tasks?: TaskRecord[];
  error?: string;
};

export type AttributesPayload = {
  attributes?: AttributeRecord[];
  error?: string;
};

export type TaskMutationPayload = {
  task?: TaskRecord;
  error?: string;
};

export type DeletePayload = {
  error?: string;
};

export type TaskFormState = {
  attributeId: string;
  title: string;
  description: string;
  taskKind: TaskKind;
  cadence: TaskCadence | "";
  dueDate: string;
  isActive: boolean;
};

export const TASK_KINDS: TaskKind[] = ["RECURRING", "TODO"];
export const TASK_CADENCES: TaskCadence[] = ["DAILY", "WEEKLY", "MONTHLY"];

export const TASK_KIND_LABELS: Record<TaskKind, string> = {
  RECURRING: "Recurring",
  TODO: "To-do",
  HABIT: "Habit",
};

export const CADENCE_LABELS: Record<TaskCadence, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

export async function readTaskJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function createEmptyFormState(attributes: AttributeRecord[]): TaskFormState {
  return {
    attributeId: attributes[0]?.id ?? "",
    title: "",
    description: "",
    taskKind: "RECURRING",
    cadence: "DAILY",
    dueDate: "",
    isActive: true,
  };
}

export function createFormStateFromTask(task: TaskRecord): TaskFormState {
  return {
    attributeId: task.attributeId,
    title: task.title,
    description: task.description ?? "",
    taskKind: task.taskKind,
    cadence: (task.cadence as TaskCadence | null) ?? "",
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    isActive: task.isActive,
  };
}

export function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
