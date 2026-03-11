"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Sparkles } from "lucide-react";

import { AppSidebar, appNavItems } from "@/components/app/app-sidebar";
import { SignOutButton } from "@/components/app/sign-out-button";
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
      appNavItems.find(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
      ) ?? appNavItems[0]
    );
  }, [pathname]);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[18rem_minmax(0,1fr)] md:gap-5 md:p-5">
      <aside className="hidden md:block">
        <AppSidebar
          pathname={pathname}
          userEmail={userEmail}
          userName={userName}
        />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-border/75 bg-background/85 backdrop-blur-md md:rounded-[calc(var(--radius)+0.35rem)] md:border md:bg-card/80">
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-4" />
                <span className="sr-only">Open navigation</span>
              </Button>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {activeItem.label}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {activeItem.summary}
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-muted/80 px-3 py-2 text-sm text-muted-foreground md:flex">
              <Sparkles className="size-4 text-accent-foreground" />
              Better Auth session is live
            </div>
            <SignOutButton />
          </div>
        </header>

        <main className="px-4 py-6 md:px-2 md:py-6">{children}</main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(88vw,22rem)] bg-sidebar p-4">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Navigate across the Rythm app shell.</SheetDescription>
          </SheetHeader>
          <AppSidebar
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
