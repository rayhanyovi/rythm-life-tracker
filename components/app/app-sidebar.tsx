import Link from "next/link";
import {
  Compass,
  FolderOpen,
  Gauge,
  History,
  ListTodo,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { AppNavItem } from "@/types/app";

export const appNavItems: AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    summary: "Fast check-in for the current period.",
    icon: Gauge,
  },
  {
    href: "/quests",
    label: "Quests",
    summary: "Create, edit, and deactivate recurring quests.",
    icon: ListTodo,
  },
  {
    href: "/categories",
    label: "Categories",
    summary: "Organize quests into life areas.",
    icon: FolderOpen,
  },
  {
    href: "/history",
    label: "History",
    summary: "Review completions and notes.",
    icon: History,
  },
];

type AppSidebarProps = {
  pathname: string;
  userEmail: string;
  userName: string;
  onNavigate?: () => void;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({
  pathname,
  userEmail,
  userName,
  onNavigate,
}: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col rounded-[calc(var(--radius)+0.4rem)] border border-sidebar-border bg-sidebar/95 p-4 shadow-[0_32px_70px_-54px_rgba(34,42,28,0.45)]">
      <div className="flex items-center gap-3 px-2 pb-4">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Compass className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            Rythm
          </p>
          <p className="text-sm text-muted-foreground">
            Simple structure for recurring life quests
          </p>
        </div>
      </div>

      <Separator className="mb-4" />

      <nav className="space-y-2">
        {appNavItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-start gap-3 rounded-[calc(var(--radius)-0.15rem)] px-3 py-3 transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/75 hover:text-sidebar-accent-foreground",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl border transition-colors",
                  active
                    ? "border-primary/30 bg-primary/15 text-primary"
                    : "border-border/70 bg-background/60 text-muted-foreground group-hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="font-medium">{item.label}</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.summary}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-6">
        <div className="rounded-[calc(var(--radius)-0.1rem)] bg-background/75 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="size-4 text-accent-foreground" />
            Signed in
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {userName}
            <br />
            {userEmail}
          </p>
        </div>
        <Button variant="outline" className="w-full justify-start">
          Current routes are session protected
        </Button>
      </div>
    </div>
  );
}
