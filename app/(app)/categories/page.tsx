import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { Card, CardContent } from "@/components/ui/card";

const starterCategories = [
  "Spiritual",
  "Finance",
  "Career",
  "Health",
  "Personal Growth",
  "Relationship",
];

export default function CategoriesPage() {
  return (
    <PageShell
      eyebrow="Wheel of life"
      title="Categories"
      description="Category management will stay lightweight: create, rename, reorder, and protect deletion when quests still depend on a category."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
            {starterCategories.map((category) => (
              <div
                key={category}
                className="rounded-[calc(var(--radius)-0.2rem)] border border-border/70 bg-background/80 px-4 py-4"
              >
                <p className="font-medium">{category}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Seed-ready default category candidate
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <EmptyState
          title="Reordering and CRUD are next"
          description="The category page is now anchored in the root app and ready for actual persistence."
        />
      </div>
    </PageShell>
  );
}
