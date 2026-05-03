"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import {
  AppSidebar,
  appNavItems,
  isAppNavItemActive,
} from "@/components/app/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type AppShellProps = {
  children: React.ReactNode;
  userEmail: string;
  userName: string;
};

export function AppShell({ children, userEmail, userName }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = useMemo(() => {
    return (
      appNavItems.find((item) => isAppNavItemActive(item, pathname)) ??
      appNavItems[0]
    );
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[22rem_minmax(0,1fr)] md:gap-4 md:p-4">
      <aside className="hidden md:block">
        <div className="sticky top-4 h-[calc(100vh-2rem)]">
          <AppSidebar
            pathname={pathname}
            userEmail={userEmail}
            userName={userName}
          />
        </div>
      </aside>

      <div className="min-w-0 md:py-4">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/94 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Tasks
              </p>
              <p className="truncate text-base font-semibold tracking-tight text-foreground">
                {activeItem.label}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
              <span className="sr-only">Open workspace navigation</span>
            </Button>
          </div>
          <div className="px-4 pb-3">
            <p className="text-sm leading-6 text-muted-foreground">
              {activeItem.summary}
            </p>
          </div>
        </header>

        <main className="px-4 pt-4 pb-8 md:px-0 md:py-0">{children}</main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(92vw,24rem)] bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Workspace navigation</SheetTitle>
            <SheetDescription>Switch views and task spaces inside the Rythm app shell.</SheetDescription>
          </SheetHeader>
          <AppSidebar
            mobile
            pathname={pathname}
            userEmail={userEmail}
            userName={userName}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
