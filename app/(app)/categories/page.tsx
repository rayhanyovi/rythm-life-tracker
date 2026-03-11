import { CategoryManager } from "@/components/categories/category-manager";
import { PageShell } from "@/components/app/page-shell";

export default function CategoriesPage() {
  return (
    <PageShell
      eyebrow="Wheel of life"
      title="Categories"
      description="Organize recurring quests into steady life areas. This page now talks to the real root-app category API for create, rename, reorder, delete, and default seeding."
    >
      <CategoryManager />
    </PageShell>
  );
}
