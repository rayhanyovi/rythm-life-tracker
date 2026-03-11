import { db } from "@/lib/db";
import { DEFAULT_CATEGORY_NAMES } from "@/lib/category-defaults";

export async function bootstrapDefaultCategories(userId: string) {
  const [existingCategories, existingDefaults] = await Promise.all([
    db.category.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        sortOrder: true,
      },
    }),
    db.category.findMany({
      where: {
        userId,
        name: {
          in: [...DEFAULT_CATEGORY_NAMES],
        },
      },
      select: {
        name: true,
      },
    }),
  ]);

  const existingDefaultNames = new Set(existingDefaults.map((item) => item.name));
  const missingDefaults = DEFAULT_CATEGORY_NAMES.filter(
    (name) => !existingDefaultNames.has(name),
  );

  if (missingDefaults.length > 0) {
    const nextSortOrder =
      existingCategories.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1;

    await db.category.createMany({
      data: missingDefaults.map((name, index) => ({
        userId,
        name,
        sortOrder: nextSortOrder + index,
      })),
    });
  }

  const categories = await db.category.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
  });

  return {
    categories,
    createdNames: missingDefaults,
  };
}
