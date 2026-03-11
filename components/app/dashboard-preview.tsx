import { Eye, Flame, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const todayQuestSections = [
  {
    category: "Spiritual",
    quests: [
      { title: "Morning prayer", streak: 14, checked: true },
      { title: "Read 10 pages", streak: 5, checked: false },
    ],
  },
  {
    category: "Health",
    quests: [
      { title: "Stretch for 15 minutes", streak: 9, checked: true },
      { title: "Walk after lunch", streak: 3, checked: false },
    ],
  },
  {
    category: "Career",
    quests: [
      { title: "Deep work block", streak: 11, checked: false },
    ],
  },
];

const summaryStats = [
  { label: "Current quests", value: "5" },
  { label: "Completed today", value: "2" },
  { label: "Best live streak", value: "14" },
];

export function DashboardPreview() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground">
                Daily rhythm
              </span>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Build a day that feels structured, not crowded.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  This first slice sets the real shell for Rythm in the root
                  Next.js app. Data, auth, and actions land in the next
                  vertical slices.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">
                <Plus className="size-4" />
                Add Quest
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="size-4" />
                Show inactive
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {summaryStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="space-y-2 p-5">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {todayQuestSections.map((section) => (
            <Card key={section.category}>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">{section.category}</CardTitle>
                <CardDescription>
                  Preview of how quest sections will appear once live data is
                  wired.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {section.quests.map((quest) => (
                  <div
                    key={quest.title}
                    className="flex items-center gap-4 rounded-[calc(var(--radius)-0.2rem)] border border-border/70 bg-background/85 px-4 py-3"
                  >
                    <div
                      className={`size-5 rounded-full border-2 ${
                        quest.checked
                          ? "border-primary bg-primary"
                          : "border-border bg-background"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{quest.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Current period snapshot
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      <Flame className="size-3.5 text-accent-foreground" />
                      {quest.streak}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="hidden xl:flex xl:flex-col">
        <CardHeader>
          <CardTitle>Detail panel</CardTitle>
          <CardDescription>
            Desktop layout keeps a dedicated surface for notes, quest context,
            and quick actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Selected quest</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Once the data layer is live, this panel will show the selected
                quest summary, streak, note entry, and edit shortcuts.
              </p>
            </div>
            <div className="rounded-[calc(var(--radius)-0.25rem)] bg-muted/65 p-4 text-sm leading-6 text-muted-foreground">
              Keep the layout close to the prototype. Shift the visual language
              toward warm neutrals, stronger hierarchy, and a calmer sense of
              momentum.
            </div>
          </div>
          <Button variant="outline">Manage Quests</Button>
        </CardContent>
      </Card>
    </div>
  );
}
