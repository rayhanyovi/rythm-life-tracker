"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";

import {
  AppMobileNavigation,
  AppModuleRail,
  AppTaskRail,
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
import { cn } from "@/lib/utils";

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
  const isTaskSurfaceRoute =
    pathname === "/dashboard" ||
    pathname === "/today" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/upcoming" ||
    pathname.startsWith("/upcoming/") ||
    pathname === "/calendar" ||
    pathname.startsWith("/calendar/") ||
    pathname === "/quests" ||
    pathname.startsWith("/quests/") ||
    pathname === "/categories" ||
    pathname.startsWith("/categories/") ||
    pathname === "/history" ||
    pathname.startsWith("/history/");

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[3rem_13.5rem_minmax(0,1fr)]">
      <aside className="hidden min-h-screen bg-primary lg:block">
        <AppModuleRail pathname={pathname} userName={userName} />
      </aside>

      <aside className="hidden min-h-screen border-r border-sidebar-border bg-sidebar lg:block">
        <div className="sticky top-0 h-screen">
          <AppTaskRail
            pathname={pathname}
            userEmail={userEmail}
            userName={userName}
          />
        </div>
      </aside>

      <div className="min-w-0 bg-background lg:min-h-screen">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/94 backdrop-blur lg:hidden">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
              <span className="sr-only">Open workspace navigation</span>
            </Button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                Tasks / {activeItem.label}
              </p>
            </div>

            <Button
              asChild
              size="sm"
              className="h-9 shrink-0 px-3"
            >
              <Link href="/quests">
                <Plus className="size-4" />
                Add
              </Link>
            </Button>
          </div>
        </header>

        <main
          className={cn(
            "px-4 pt-4 pb-8 sm:px-5",
            isTaskSurfaceRoute
              ? "lg:h-screen lg:overflow-hidden lg:p-0"
              : "lg:px-5 lg:py-5 xl:px-6",
          )}
        >
          {children}
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(92vw,24rem)] bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Workspace navigation</SheetTitle>
            <SheetDescription>Switch views and task spaces inside the Rythm app shell.</SheetDescription>
          </SheetHeader>
          <AppMobileNavigation
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
