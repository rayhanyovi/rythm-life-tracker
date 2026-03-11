import { Plus } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function QuestsPage() {
  return (
    <PageShell
      eyebrow="Quest management"
      title="Quests"
      description="This management surface is in place for filters, CRUD forms, activation toggles, and future server-connected actions."
      actions={
        <Button size="sm">
          <Plus className="size-4" />
          Add Quest
        </Button>
      }
    >
      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Prepared list management</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Search, category filters, and quest rows will plug into the next
                data slice without changing this layout.
              </p>
            </div>
          </div>
          <EmptyState
            title="Quest CRUD lands next"
            description="The route exists, the shell exists, and the visual system is ready. Server-backed quest listing and forms will be wired in the next commit series."
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
