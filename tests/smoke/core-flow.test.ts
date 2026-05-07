import assert from "node:assert/strict";
import { after, beforeEach, describe, it } from "node:test";

import { TaskCadence } from "@prisma/client";

import { getCurrentPeriodKey } from "../../lib/periods";
import { db as runtimeDb } from "../../lib/db";
import { sessionApi } from "../../lib/session";
import { createInMemoryAppDb } from "../helpers/in-memory-app-db";

const database = createInMemoryAppDb();
const mutableDb = runtimeDb as unknown as typeof database.db;
const originalDb = {
  attribute: mutableDb.attribute,
  category: mutableDb.category,
  quest: mutableDb.quest,
  questCompletion: mutableDb.questCompletion,
  task: mutableDb.task,
  taskCompletion: mutableDb.taskCompletion,
};

let currentSession: { user: { id: string } } | null = {
  user: { id: "user_1" },
};
const originalGetSessionFromRequest = sessionApi.getSessionFromRequest;

async function loadRoutes() {
  const [
    attributesRoute,
    categoriesRoute,
    categoryRoute,
    tasksRoute,
    taskCurrentCompletionRoute,
    questsRoute,
    historyRoute,
  ] = await Promise.all([
    import("../../app/api/attributes/route"),
    import("../../app/api/categories/route"),
    import("../../app/api/categories/[id]/route"),
    import("../../app/api/tasks/route"),
    import("../../app/api/tasks/[id]/current-completion/route"),
    import("../../app/api/quests/route"),
    import("../../app/api/history/route"),
  ]);

  return {
    attributesRoute,
    categoriesRoute,
    categoryRoute,
    historyRoute,
    questsRoute,
    taskCurrentCompletionRoute,
    tasksRoute,
  };
}

async function readJson<T>(response: Response) {
  if (response.status === 204) {
    return null;
  }

  return (await response.json()) as T;
}

function createJsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: {
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("core route smoke flow", () => {
  beforeEach(() => {
    database.reset();
    currentSession = {
      user: { id: "user_1" },
    };
    sessionApi.getSessionFromRequest = async () => currentSession;
    mutableDb.attribute = database.db.attribute;
    mutableDb.category = database.db.category;
    mutableDb.quest = database.db.quest;
    mutableDb.questCompletion = database.db.questCompletion;
    mutableDb.task = database.db.task;
    mutableDb.taskCompletion = database.db.taskCompletion;
  });

  after(() => {
    sessionApi.getSessionFromRequest = originalGetSessionFromRequest;
    mutableDb.attribute = originalDb.attribute;
    mutableDb.category = originalDb.category;
    mutableDb.quest = originalDb.quest;
    mutableDb.questCompletion = originalDb.questCompletion;
    mutableDb.task = originalDb.task;
    mutableDb.taskCompletion = originalDb.taskCompletion;
  });

  it("supports attribute -> task -> completion -> history using authenticated handlers", async () => {
    const {
      attributesRoute,
      taskCurrentCompletionRoute,
      historyRoute,
      tasksRoute,
    } = await loadRoutes();

    // 1. Create an attribute
    const createAttributeResponse = await attributesRoute.POST(
      createJsonRequest("http://localhost/api/attributes", "POST", {
        name: "Health",
      }),
    );
    const attributePayload = await readJson<{
      attribute: {
        id: string;
        name: string;
      };
    }>(createAttributeResponse);

    assert.equal(createAttributeResponse.status, 201);
    assert.equal(attributePayload?.attribute.name, "Health");

    // 2. Create a recurring daily task
    const createTaskResponse = await tasksRoute.POST(
      createJsonRequest("http://localhost/api/tasks", "POST", {
        attributeId: attributePayload?.attribute.id,
        description: "Keep the streak alive.",
        taskKind: "RECURRING",
        cadence: "DAILY",
        title: "Morning Run",
      }),
    );
    const taskPayload = await readJson<{
      task: {
        attributeId: string;
        cadence: TaskCadence;
        id: string;
        taskKind: string;
        title: string;
      };
    }>(createTaskResponse);

    assert.equal(createTaskResponse.status, 201);
    assert.equal(taskPayload?.task.title, "Morning Run");
    assert.equal(taskPayload?.task.attributeId, attributePayload?.attribute.id);
    assert.equal(taskPayload?.task.taskKind, "RECURRING");
    assert.equal(taskPayload?.task.cadence, "DAILY");

    // 3. Mark the task complete for the current period
    const completeTaskResponse = await taskCurrentCompletionRoute.PUT(
      createJsonRequest(
        `http://localhost/api/tasks/${taskPayload?.task.id}/current-completion`,
        "PUT",
        {
          note: "Finished before breakfast",
        },
      ),
      {
        params: Promise.resolve({
          id: taskPayload!.task.id,
        }),
      },
    );
    const completionPayload = await readJson<{
      completion: {
        id: string;
        note: string | null;
        periodKey: string;
      };
    }>(completeTaskResponse);

    assert.equal(completeTaskResponse.status, 200);
    assert.equal(completionPayload?.completion.note, "Finished before breakfast");
    assert.equal(
      completionPayload?.completion.periodKey,
      getCurrentPeriodKey(TaskCadence.DAILY),
    );

    // 4. Verify the completion appears in history
    const historyResponse = await historyRoute.GET(
      new Request("http://localhost/api/history"),
    );
    const historyPayload = await readJson<{
      items: Array<{
        attributeName: string;
        cadence: string;
        note: string | null;
        periodKey: string;
        taskTitle: string;
      }>;
      nextCursor: string | null;
    }>(historyResponse);

    assert.equal(historyResponse.status, 200);
    assert.equal(historyPayload?.items.length, 1);
    assert.equal(historyPayload?.items[0]?.attributeName, "Health");
    assert.equal(historyPayload?.items[0]?.note, "Finished before breakfast");
    assert.equal(
      historyPayload?.items[0]?.periodKey,
      getCurrentPeriodKey(TaskCadence.DAILY),
    );
    assert.equal(historyPayload?.items[0]?.taskTitle, "Morning Run");
    assert.equal(historyPayload?.items[0]?.cadence, "DAILY");
    assert.equal(historyPayload?.nextCursor, null);
  });

  it("keeps category delete protected while quests still use it", async () => {
    const { categoriesRoute, categoryRoute, questsRoute } = await loadRoutes();

    const categoryResponse = await categoriesRoute.POST(
      createJsonRequest("http://localhost/api/categories", "POST", {
        name: "Career",
      }),
    );
    const categoryPayload = await readJson<{
      category: {
        id: string;
      };
    }>(categoryResponse);

    await questsRoute.POST(
      createJsonRequest("http://localhost/api/quests", "POST", {
        categoryId: categoryPayload?.category.id,
        questType: "WEEKLY",
        title: "Ship Weekly Plan",
      }),
    );

    const deleteResponse = await categoryRoute.DELETE(
      new Request(`http://localhost/api/categories/${categoryPayload?.category.id}`, {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          id: categoryPayload!.category.id,
        }),
      },
    );
    const deletePayload = await readJson<{ error: string }>(deleteResponse);

    assert.equal(deleteResponse.status, 409);
    assert.equal(
      deletePayload?.error,
      "Habit List cannot be deleted while tasks still use it.",
    );
  });

  it("rejects unauthenticated access", async () => {
    const { attributesRoute } = await loadRoutes();

    currentSession = null;

    const response = await attributesRoute.GET(
      new Request("http://localhost/api/attributes"),
    );
    const payload = await readJson<{ error: string }>(response);

    assert.equal(response.status, 401);
    assert.equal(payload?.error, "Authentication required.");
  });
});
