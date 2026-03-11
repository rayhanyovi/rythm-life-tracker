import { PageShell } from "@/components/app/page-shell";
import { QuestManager } from "@/components/quests/quest-manager";

export default function QuestsPage() {
  return (
    <PageShell
      eyebrow="Quest management"
      title="Quests"
      description="Manage the full quest library from one place: search by intent, filter by life area or recurrence, and keep create, edit, deactivate, and delete flows close to the list."
    >
      <QuestManager />
    </PageShell>
  );
}
