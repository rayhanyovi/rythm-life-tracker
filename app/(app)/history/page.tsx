import { PageShell } from "@/components/app/page-shell";
import { HistoryScreen } from "@/components/history/history-screen";

export default function HistoryPage() {
  return (
    <PageShell
      eyebrow="Completion archive"
      title="History"
      description="Review the recent archive with practical filters, edit notes directly on a selected completion, and remove entries when the history needs correction."
    >
      <HistoryScreen />
    </PageShell>
  );
}
