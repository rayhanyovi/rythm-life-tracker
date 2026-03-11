import { requireSession } from "@/lib/session";
import { AppShell } from "@/components/app/app-shell";

export default async function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession();

  return (
    <AppShell
      userEmail={session.user.email}
      userName={session.user.name}
    >
      {children}
    </AppShell>
  );
}
