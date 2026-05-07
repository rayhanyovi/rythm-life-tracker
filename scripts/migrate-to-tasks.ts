/**
 * Backfill script: copies existing data from the legacy tables
 * (categories, quests, quest_completions) into the new tables
 * (attributes, tasks, task_completions).
 *
 * Safe to run multiple times — uses upsert / skip-on-conflict logic.
 * Run with: npm run migrate:tasks
 */

import { QuestType, TaskCadence, TaskKind } from "@prisma/client";

import { db } from "@/lib/db";

function questTypeToTaskKindAndCadence(questType: QuestType): {
  taskKind: TaskKind;
  cadence: TaskCadence | null;
} {
  switch (questType) {
    case QuestType.DAILY:
      return { taskKind: TaskKind.RECURRING, cadence: TaskCadence.DAILY };
    case QuestType.WEEKLY:
      return { taskKind: TaskKind.RECURRING, cadence: TaskCadence.WEEKLY };
    case QuestType.MONTHLY:
      return { taskKind: TaskKind.RECURRING, cadence: TaskCadence.MONTHLY };
    case QuestType.MAIN:
      return { taskKind: TaskKind.TODO, cadence: null };
  }
}

function questTypeToCadence(questType: QuestType): TaskCadence {
  switch (questType) {
    case QuestType.DAILY:
      return TaskCadence.DAILY;
    case QuestType.WEEKLY:
      return TaskCadence.WEEKLY;
    case QuestType.MONTHLY:
      return TaskCadence.MONTHLY;
    case QuestType.MAIN:
      return TaskCadence.ONCE;
  }
}

async function main() {
  console.log("=== Rythm task-system backfill ===\n");

  // ── 1. Attributes (from categories) ────────────────────────────────────────
  const categories = await db.category.findMany({ orderBy: { createdAt: "asc" } });
  console.log(`Found ${categories.length} categories → migrating to attributes…`);

  for (const cat of categories) {
    await db.attribute.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        userId: cat.userId,
        name: cat.name,
        sortOrder: cat.sortOrder,
        createdAt: cat.createdAt,
      },
    });
  }
  console.log(`  ✓ ${categories.length} attributes written\n`);

  // ── 2. Tasks (from quests) ──────────────────────────────────────────────────
  const quests = await db.quest.findMany({ orderBy: { createdAt: "asc" } });
  console.log(`Found ${quests.length} quests → migrating to tasks…`);

  for (const quest of quests) {
    const { taskKind, cadence } = questTypeToTaskKindAndCadence(quest.questType);

    await db.task.upsert({
      where: { id: quest.id },
      update: {},
      create: {
        id: quest.id,
        userId: quest.userId,
        attributeId: quest.categoryId,
        title: quest.title,
        description: quest.description,
        taskKind,
        cadence,
        dueDate: null,
        habitMode: null,
        isActive: quest.isActive,
        createdAt: quest.createdAt,
        updatedAt: quest.updatedAt,
      },
    });
  }
  console.log(`  ✓ ${quests.length} tasks written\n`);

  // ── 3. Task completions (from quest_completions) ────────────────────────────
  const questCompletions = await db.questCompletion.findMany({
    orderBy: { createdAt: "asc" },
  });
  console.log(
    `Found ${questCompletions.length} quest_completions → migrating to task_completions…`,
  );

  let skipped = 0;
  for (const qc of questCompletions) {
    const cadence = questTypeToCadence(qc.periodType);
    // MAIN completions had periodKey="ONE_TIME" → normalize to "ONCE"
    const periodKey = qc.periodKey === "ONE_TIME" ? "ONCE" : qc.periodKey;

    try {
      await db.taskCompletion.upsert({
        where: {
          userId_taskId_cadence_periodKey: {
            userId: qc.userId,
            taskId: qc.questId,
            cadence,
            periodKey,
          },
        },
        update: {},
        create: {
          id: qc.id,
          userId: qc.userId,
          taskId: qc.questId,
          cadence,
          periodKey,
          completedAt: qc.completedAt,
          note: qc.note,
          createdAt: qc.createdAt,
        },
      });
    } catch {
      // Task row may not exist if the quest was deleted between steps
      skipped += 1;
    }
  }
  console.log(
    `  ✓ ${questCompletions.length - skipped} completions written` +
      (skipped ? `, ${skipped} skipped (orphaned)` : "") +
      "\n",
  );

  // ── 4. Summary ──────────────────────────────────────────────────────────────
  const [attrCount, taskCount, tcCount] = await Promise.all([
    db.attribute.count(),
    db.task.count(),
    db.taskCompletion.count(),
  ]);

  console.log("=== New table row counts ===");
  console.log(`  attributes:       ${attrCount}`);
  console.log(`  tasks:            ${taskCount}`);
  console.log(`  task_completions: ${tcCount}`);
  console.log("\nBackfill complete ✓");
}

main()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
