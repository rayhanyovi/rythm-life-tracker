import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createCategorySchema,
  reorderCategoriesSchema,
} from "../../lib/validators/category";
import {
  updateCompletionSchema,
  upsertCurrentCompletionSchema,
} from "../../lib/validators/completion";
import { dashboardQuerySchema } from "../../lib/validators/dashboard";
import { historyQuerySchema } from "../../lib/validators/history";
import {
  createQuestSchema,
  listQuestsQuerySchema,
  updateQuestSchema,
} from "../../lib/validators/quest";

describe("category validators", () => {
  it("trims names and rejects blank values", () => {
    assert.deepEqual(createCategorySchema.parse({ name: "  Health  " }), {
      name: "Health",
    });
    assert.equal(createCategorySchema.safeParse({ name: "   " }).success, false);
  });

  it("requires at least one category id during reorder", () => {
    assert.equal(
      reorderCategoriesSchema.safeParse({ categoryIds: [] }).success,
      false,
    );
    assert.deepEqual(
      reorderCategoriesSchema.parse({ categoryIds: ["cat-1", "cat-2"] }),
      {
      categoryIds: ["cat-1", "cat-2"],
      },
    );
  });
});

describe("quest validators", () => {
  it("normalizes blank descriptions to null during quest creation", () => {
    assert.deepEqual(
      createQuestSchema.parse({
        categoryId: "cat-1",
        description: "   ",
        questType: "DAILY",
        title: "  Morning Run  ",
      }),
      {
      categoryId: "cat-1",
      description: null,
      questType: "DAILY",
      title: "Morning Run",
      },
    );
  });

  it("rejects empty update payloads", () => {
    assert.equal(updateQuestSchema.safeParse({}).success, false);
  });

  it("normalizes list query values", () => {
    assert.deepEqual(
      listQuestsQuerySchema.parse({
        includeInactive: "true",
        search: "  run  ",
      }),
      {
      includeInactive: true,
      search: "run",
      },
    );
  });
});

describe("completion validators", () => {
  it("normalizes blank notes to null", () => {
    assert.deepEqual(
      upsertCurrentCompletionSchema.parse({
        note: "   ",
      }),
      {
      note: null,
      },
    );
  });

  it("accepts explicit null for note updates", () => {
    assert.deepEqual(updateCompletionSchema.parse({ note: null }), {
      note: null,
    });
  });
});

describe("dashboard and history validators", () => {
  it("normalizes dashboard flags", () => {
    assert.deepEqual(dashboardQuerySchema.parse({ includeInactive: "false" }), {
      includeInactive: false,
    });
  });

  it("rejects malformed history dates", () => {
    assert.equal(
      historyQuerySchema.safeParse({
        from: "2026/03/11",
      }).success,
      false,
    );
  });

  it("accepts valid history filters", () => {
    assert.deepEqual(
      historyQuerySchema.parse({
        categoryId: "cat-1",
        from: "2026-03-01",
        questId: "quest-1",
        questType: "WEEKLY",
        to: "2026-03-31",
      }),
      {
      categoryId: "cat-1",
      from: "2026-03-01",
      questId: "quest-1",
      questType: "WEEKLY",
      to: "2026-03-31",
      },
    );
  });
});
