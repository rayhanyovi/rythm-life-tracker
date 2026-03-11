import type { Page } from "@playwright/test";

const categoriesPayload = {
  categories: [
    { id: "cat-health", name: "Health", sortOrder: 0 },
    { id: "cat-career", name: "Career", sortOrder: 1 },
  ],
};

const questsPayload = {
  quests: [
    {
      category: categoriesPayload.categories[0],
      categoryId: "cat-health",
      createdAt: "2026-03-10T00:00:00.000Z",
      description: "Keep momentum steady.",
      id: "quest-run",
      isActive: true,
      questType: "DAILY",
      title: "Morning Run",
      updatedAt: "2026-03-11T00:00:00.000Z",
    },
    {
      category: categoriesPayload.categories[1],
      categoryId: "cat-career",
      createdAt: "2026-03-08T00:00:00.000Z",
      description: "Reflect on the work week.",
      id: "quest-review",
      isActive: false,
      questType: "WEEKLY",
      title: "Weekly Review",
      updatedAt: "2026-03-10T00:00:00.000Z",
    },
  ],
};

const dashboardPayload = {
  categories: [
    {
      categoryId: "cat-health",
      categoryName: "Health",
      items: [
        {
          categoryId: "cat-health",
          categoryName: "Health",
          completionId: "completion-run",
          currentPeriodKey: "2026-03-11",
          description: "Keep momentum steady.",
          isActive: true,
          isCompletedNow: true,
          note: "Done before work.",
          questId: "quest-run",
          questType: "DAILY",
          streak: 5,
          title: "Morning Run",
        },
      ],
    },
  ],
  date: "2026-03-11",
};

const historyPayload = {
  items: [
    {
      categoryId: "cat-health",
      categoryName: "Health",
      completedAt: "2026-03-11T05:00:00.000Z",
      completionId: "completion-run",
      note: "Done before work.",
      periodKey: "2026-03-11",
      questId: "quest-run",
      questTitle: "Morning Run",
      questType: "DAILY",
    },
  ],
  nextCursor: null,
};

export const e2eAuthHeaders = {
  "x-rythm-e2e-user-email": "e2e@rythm.local",
  "x-rythm-e2e-user-id": "user-e2e",
  "x-rythm-e2e-user-name": "E2E User",
};

export async function mockAuthenticatedAppApi(page: Page) {
  await page.route("**/api/dashboard**", async (route) => {
    await route.fulfill({
      body: JSON.stringify(dashboardPayload),
      contentType: "application/json",
      status: 200,
    });
  });

  await page.route("**/api/categories**", async (route) => {
    await route.fulfill({
      body: JSON.stringify(categoriesPayload),
      contentType: "application/json",
      status: 200,
    });
  });

  await page.route("**/api/quests**", async (route) => {
    await route.fulfill({
      body: JSON.stringify(questsPayload),
      contentType: "application/json",
      status: 200,
    });
  });

  await page.route("**/api/history**", async (route) => {
    await route.fulfill({
      body: JSON.stringify(historyPayload),
      contentType: "application/json",
      status: 200,
    });
  });
}
