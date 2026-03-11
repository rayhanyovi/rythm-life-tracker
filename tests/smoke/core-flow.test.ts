import assert from "node:assert/strict";
import { after, beforeEach, describe, it } from "node:test";

import { QuestType } from "@prisma/client";

import { getCurrentPeriodKey } from "../../lib/periods";
import { db as runtimeDb } from "../../lib/db";
import { sessionApi } from "../../lib/session";
import { createInMemoryAppDb } from "../helpers/in-memory-app-db";

const database = createInMemoryAppDb();
const mutableDb = runtimeDb as unknown as typeof database.db;
const originalDb = {
  category: mutableDb.category,
  quest: mutableDb.quest,
  questCompletion: mutableDb.questCompletion,
};

let currentSession: { user: { id: string } } | null = {
  user: { id: "user_1" },
};
const originalGetSessionFromRequest = sessionApi.getSessionFromRequest;

async function loadRoutes() {
  const [
    categoriesRoute,
    categoryRoute,
    questsRoute,
    currentCompletionRoute,
    historyRoute,
  ] = await Promise.all([
    import("../../app/api/categories/route"),
    import("../../app/api/categories/[id]/route"),
    import("../../app/api/quests/route"),
    import("../../app/api/quests/[id]/current-completion/route"),
    import("../../app/api/history/route"),
  ]);

  return {
    categoriesRoute,
    categoryRoute,
    questsRoute,
    currentCompletionRoute,
    historyRoute,
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
    mutableDb.category = database.db.category;
    mutableDb.quest = database.db.quest;
    mutableDb.questCompletion = database.db.questCompletion;
  });

  after(() => {
    sessionApi.getSessionFromRequest = originalGetSessionFromRequest;
    mutableDb.category = originalDb.category;
    mutableDb.quest = originalDb.quest;
    mutableDb.questCompletion = originalDb.questCompletion;
  });

  it("supports category -> quest -> completion -> history using authenticated handlers", async () => {
    const {
      categoriesRoute,
      currentCompletionRoute,
      historyRoute,
      questsRoute,
    } = await loadRoutes();

    const createCategoryResponse = await categoriesRoute.POST(
      createJsonRequest("http://localhost/api/categories", "POST", {
        name: "Health",
      }),
    );
    const categoryPayload = await readJson<{
      category: {
        id: string;
        name: string;
      };
    }>(createCategoryResponse);

    assert.equal(createCategoryResponse.status, 201);
    assert.equal(categoryPayload?.category.name, "Health");

    const createQuestResponse = await questsRoute.POST(
      createJsonRequest("http://localhost/api/quests", "POST", {
        categoryId: categoryPayload?.category.id,
        description: "Keep the streak alive.",
        questType: "DAILY",
        title: "Morning Run",
      }),
    );
    const questPayload = await readJson<{
      quest: {
        categoryId: string;
        id: string;
        questType: QuestType;
        title: string;
      };
    }>(createQuestResponse);

    assert.equal(createQuestResponse.status, 201);
    assert.equal(questPayload?.quest.title, "Morning Run");
    assert.equal(questPayload?.quest.categoryId, categoryPayload?.category.id);

    const completeQuestResponse = await currentCompletionRoute.PUT(
      createJsonRequest(
        `http://localhost/api/quests/${questPayload?.quest.id}/current-completion`,
        "PUT",
        {
          note: "Finished before breakfast",
        },
      ),
      {
        params: Promise.resolve({
          id: questPayload!.quest.id,
        }),
      },
    );
    const completionPayload = await readJson<{
      completion: {
        id: string;
        note: string | null;
        periodKey: string;
      };
    }>(completeQuestResponse);

    assert.equal(completeQuestResponse.status, 200);
    assert.equal(completionPayload?.completion.note, "Finished before breakfast");
    assert.equal(
      completionPayload?.completion.periodKey,
      getCurrentPeriodKey(QuestType.DAILY),
    );

    const historyResponse = await historyRoute.GET(
      new Request("http://localhost/api/history"),
    );
    const historyPayload = await readJson<{
      items: Array<{
        categoryName: string;
        note: string | null;
        periodKey: string;
        questTitle: string;
      }>;
      nextCursor: string | null;
    }>(historyResponse);

    assert.equal(historyResponse.status, 200);
    assert.equal(historyPayload?.items.length, 1);
    assert.equal(historyPayload?.items[0]?.categoryName, "Health");
    assert.equal(historyPayload?.items[0]?.note, "Finished before breakfast");
    assert.equal(
      historyPayload?.items[0]?.periodKey,
      getCurrentPeriodKey(QuestType.DAILY),
    );
    assert.equal(historyPayload?.items[0]?.questTitle, "Morning Run");
    assert.equal(historyPayload?.items[0]?.questType, "DAILY");
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
      "Category cannot be deleted while quests still use it.",
    );
  });

  it("rejects unauthenticated access", async () => {
    const { categoriesRoute } = await loadRoutes();

    currentSession = null;

    const response = await categoriesRoute.GET(
      new Request("http://localhost/api/categories"),
    );
    const payload = await readJson<{ error: string }>(response);

    assert.equal(response.status, 401);
    assert.equal(payload?.error, "Authentication required.");
  });
});
