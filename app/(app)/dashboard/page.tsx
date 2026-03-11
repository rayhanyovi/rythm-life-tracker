import { DashboardPreview } from "@/components/app/dashboard-preview";
import { PageShell } from "@/components/app/page-shell";

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="Daily overview"
      title="Dashboard"
      description="The dashboard now mirrors the real destination of Rythm: a fast current-period checklist, grouped by category, with space for a persistent detail panel."
    >
      <DashboardPreview />
    </PageShell>
  );
}
