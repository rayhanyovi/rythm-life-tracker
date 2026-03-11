import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { PageShell } from "@/components/app/page-shell";

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="Daily overview"
      title="Dashboard"
      description="Use the current-period dashboard to check quests fast, filter by life area, keep inactive items optional, and store short notes on the active completion."
    >
      <DashboardScreen />
    </PageShell>
  );
}
