import { QuestType } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

import { bootstrapDefaultCategories } from "@/lib/categories";
import { db } from "@/lib/db";
import { getPeriodKeyForDate, shiftPeriodDate } from "@/lib/periods";

const DEMO_ACCOUNT = {
  email: "demo@rythm.local",
  name: "Demo User",
  password: "demo12345",
};

async function ensureDemoUser() {
  const existingUser = await db.user.findUnique({
    where: {
      email: DEMO_ACCOUNT.email,
    },
  });

  const user =
    existingUser ??
    (await db.user.create({
      data: {
        email: DEMO_ACCOUNT.email,
        emailVerified: true,
        id: "seed-demo-user",
        name: DEMO_ACCOUNT.name,
      },
    }));

  if (existingUser) {
    await db.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        emailVerified: true,
        name: DEMO_ACCOUNT.name,
      },
    });
  }

  const credentialAccount = await db.account.findFirst({
    where: {
      providerId: "credential",
      userId: user.id,
    },
  });

  const passwordHash = await hashPassword(DEMO_ACCOUNT.password);

  if (credentialAccount) {
    await db.account.update({
      where: {
        id: credentialAccount.id,
      },
      data: {
        password: passwordHash,
      },
    });
  } else {
    await db.account.create({
      data: {
        accountId: user.id,
        id: "seed-demo-credential-account",
        password: passwordHash,
        providerId: "credential",
        userId: user.id,
      },
    });
  }

  return user;
}

async function resetDemoData(userId: string) {
  await db.questCompletion.deleteMany({
    where: {
      userId,
    },
  });

  await db.quest.deleteMany({
    where: {
      userId,
    },
  });

  await db.category.deleteMany({
    where: {
      userId,
    },
  });
}

async function createQuest(options: {
  categoryId: string;
  description?: string;
  questType: QuestType;
  title: string;
  userId: string;
}) {
  return db.quest.create({
    data: {
      categoryId: options.categoryId,
      description: options.description ?? null,
      questType: options.questType,
      title: options.title,
      userId: options.userId,
    },
  });
}

function buildCompletion(options: {
  date: Date;
  note?: string;
  questId: string;
  questType: QuestType;
  userId: string;
}) {
  return {
    completedAt: options.date,
    note: options.note ?? null,
    periodKey: getPeriodKeyForDate(options.questType, options.date),
    periodType: options.questType,
    questId: options.questId,
    userId: options.userId,
  };
}

async function seedDemoData(userId: string) {
  const { categories } = await bootstrapDefaultCategories(userId);
  const categoryByName = new Map(categories.map((category) => [category.name, category]));

  const spiritualCategory = categoryByName.get("Spiritual");
  const financeCategory = categoryByName.get("Finance");
  const careerCategory = categoryByName.get("Career");
  const healthCategory = categoryByName.get("Health");
  const personalGrowthCategory = categoryByName.get("Personal Growth");
  const relationshipCategory = categoryByName.get("Relationship");

  if (
    !spiritualCategory ||
    !financeCategory ||
    !careerCategory ||
    !healthCategory ||
    !personalGrowthCategory ||
    !relationshipCategory
  ) {
    throw new Error("Default categories could not be created for the demo user.");
  }

  const [
    morningPrayer,
    expenseCheck,
    weeklyPlanning,
    workout,
    readingSession,
    dateNight,
    shipMvp,
  ] = await Promise.all([
    createQuest({
      categoryId: spiritualCategory.id,
      description: "Ten quiet minutes before opening the laptop.",
      questType: QuestType.DAILY,
      title: "Morning prayer",
      userId,
    }),
    createQuest({
      categoryId: financeCategory.id,
      description: "Review what went out today and keep spending visible.",
      questType: QuestType.DAILY,
      title: "Check expenses",
      userId,
    }),
    createQuest({
      categoryId: careerCategory.id,
      description: "Reset the week before it drifts.",
      questType: QuestType.WEEKLY,
      title: "Plan the week",
      userId,
    }),
    createQuest({
      categoryId: healthCategory.id,
      description: "Short workout that is easy to repeat every day.",
      questType: QuestType.DAILY,
      title: "20 minute workout",
      userId,
    }),
    createQuest({
      categoryId: personalGrowthCategory.id,
      description: "Finish one meaningful book chapter this month.",
      questType: QuestType.MONTHLY,
      title: "Read one chapter",
      userId,
    }),
    createQuest({
      categoryId: relationshipCategory.id,
      description: "Protect time that is not multitasked away.",
      questType: QuestType.WEEKLY,
      title: "Date night",
      userId,
    }),
    createQuest({
      categoryId: careerCategory.id,
      description: "One-time milestone for the current product push.",
      questType: QuestType.MAIN,
      title: "Ship Rythm MVP",
      userId,
    }),
  ]);

  const now = new Date();
  const dailyTwoDaysAgo = shiftPeriodDate(QuestType.DAILY, now, -2);
  const dailyYesterday = shiftPeriodDate(QuestType.DAILY, now, -1);
  const weeklyLastWeek = shiftPeriodDate(QuestType.WEEKLY, now, -1);
  const monthlyLastMonth = shiftPeriodDate(QuestType.MONTHLY, now, -1);
  const twoWeeksAgo = shiftPeriodDate(QuestType.WEEKLY, now, -2);

  await db.questCompletion.createMany({
    data: [
      buildCompletion({
        date: dailyTwoDaysAgo,
        note: "Started the day without opening chat first.",
        questId: morningPrayer.id,
        questType: QuestType.DAILY,
        userId,
      }),
      buildCompletion({
        date: dailyYesterday,
        note: "Kept it short and consistent.",
        questId: morningPrayer.id,
        questType: QuestType.DAILY,
        userId,
      }),
      buildCompletion({
        date: now,
        note: "Done before breakfast.",
        questId: morningPrayer.id,
        questType: QuestType.DAILY,
        userId,
      }),
      buildCompletion({
        date: dailyYesterday,
        note: "Logged all food delivery spending.",
        questId: expenseCheck.id,
        questType: QuestType.DAILY,
        userId,
      }),
      buildCompletion({
        date: now,
        note: "No surprise transactions today.",
        questId: expenseCheck.id,
        questType: QuestType.DAILY,
        userId,
      }),
      buildCompletion({
        date: dailyTwoDaysAgo,
        note: "Mobility only.",
        questId: workout.id,
        questType: QuestType.DAILY,
        userId,
      }),
      buildCompletion({
        date: dailyYesterday,
        note: "Upper body.",
        questId: workout.id,
        questType: QuestType.DAILY,
        userId,
      }),
      buildCompletion({
        date: now,
        note: "Quick core session.",
        questId: workout.id,
        questType: QuestType.DAILY,
        userId,
      }),
      buildCompletion({
        date: weeklyLastWeek,
        note: "Last week priorities were realistic.",
        questId: weeklyPlanning.id,
        questType: QuestType.WEEKLY,
        userId,
      }),
      buildCompletion({
        date: now,
        note: "This week has only three main pushes.",
        questId: weeklyPlanning.id,
        questType: QuestType.WEEKLY,
        userId,
      }),
      buildCompletion({
        date: twoWeeksAgo,
        note: "Simple dinner out.",
        questId: dateNight.id,
        questType: QuestType.WEEKLY,
        userId,
      }),
      buildCompletion({
        date: now,
        note: "Protected Friday evening.",
        questId: dateNight.id,
        questType: QuestType.WEEKLY,
        userId,
      }),
      buildCompletion({
        date: monthlyLastMonth,
        note: "Finished the first chapter last month.",
        questId: readingSession.id,
        questType: QuestType.MONTHLY,
        userId,
      }),
      buildCompletion({
        date: now,
        note: "Current month chapter already started.",
        questId: readingSession.id,
        questType: QuestType.MONTHLY,
        userId,
      }),
      buildCompletion({
        date: shiftPeriodDate(QuestType.DAILY, now, -10),
        note: "Landing page, auth, and base app shell shipped.",
        questId: shipMvp.id,
        questType: QuestType.MAIN,
        userId,
      }),
    ],
  });

  return {
    categoryCount: categories.length,
    questCount: 7,
  };
}

async function main() {
  const user = await ensureDemoUser();
  await resetDemoData(user.id);
  const seeded = await seedDemoData(user.id);

  console.log("Demo seed complete.");
  console.log(`- email: ${DEMO_ACCOUNT.email}`);
  console.log(`- password: ${DEMO_ACCOUNT.password}`);
  console.log(`- userId: ${user.id}`);
  console.log(`- categories: ${seeded.categoryCount}`);
  console.log(`- quests: ${seeded.questCount}`);
}

main()
  .catch((error) => {
    console.error("Demo seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
