import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { Card, CardContent } from "@/components/ui/card";

const previewHistory = [
  {
    day: "Wednesday, March 11",
    items: ["Morning prayer", "Stretch for 15 minutes"],
  },
  {
    day: "Tuesday, March 10",
    items: ["Read 10 pages", "Deep work block"],
  },
];

export default function HistoryPage() {
  return (
    <PageShell
      eyebrow="Completion archive"
      title="History"
      description="History will focus on clarity rather than analytics: simple filters, grouped completion lists, editable notes, and reversible actions."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <Card>
          <CardContent className="space-y-6 p-6">
            {previewHistory.map((group) => (
              <div key={group.day} className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {group.day}
                </p>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-[calc(var(--radius)-0.2rem)] border border-border/70 bg-background/85 px-4 py-3"
                    >
                      <p className="font-medium">{item}</p>
                      <p className="text-sm text-muted-foreground">
                        Note and period metadata will show here once the data
                        layer is connected.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <EmptyState
          title="Filters and note editing are queued"
          description="This route is now present in the shell and ready for the real history contract from the tech plan."
        />
      </div>
    </PageShell>
  );
}
