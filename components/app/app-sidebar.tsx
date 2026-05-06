import Link from "next/link";
import {
  BookOpenText,
  CalendarDays,
  CheckSquare2,
  History,
  Layers3,
  ListTodo,
  NotebookPen,
  Repeat2,
} from "lucide-react";

import { SignOutButton } from "@/components/app/sign-out-button";
import { cn } from "@/lib/utils";
import type { AppNavGroup, AppNavItem } from "@/types/app";

export const moduleNavItems: AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Tasks",
    summary: "Daily work, planning, and review.",
    icon: CheckSquare2,
  },
  {
    disabled: true,
    label: "Journal",
    summary: "Future reflective module.",
    icon: BookOpenText,
  },
];

export const taskNavGroups: AppNavGroup[] = [
  {
    label: "Views",
    items: [
      {
        aliases: ["/today"],
        href: "/dashboard",
        label: "Today",
        summary: "Due now and recurring work in one surface.",
        icon: Layers3,
      },
      {
        href: "/upcoming",
        label: "Upcoming",
        summary: "Short-horizon planning across future dates.",
        icon: Repeat2,
      },
      {
        href: "/calendar",
        label: "Calendar",
        summary: "Grid planning over the same task pool.",
        icon: CalendarDays,
      },
      {
        aliases: ["/activity-log"],
        href: "/history",
        label: "Activity Log",
        summary: "Completion notes and correction flow.",
        icon: History,
      },
    ],
  },
  {
    label: "Task Spaces",
    items: [
      {
        aliases: ["/lists"],
        href: "/quests",
        label: "Lists",
        summary: "Task buckets and recurring definitions.",
        icon: ListTodo,
      },
      {
        aliases: ["/habit-lists"],
        href: "/categories",
        label: "Habit Lists",
        summary: "Recurring containers and cadence groups.",
        icon: NotebookPen,
      },
    ],
  },
];

export const appNavItems = taskNavGroups.flatMap((group) =>
  group.items.filter((item): item is AppNavItem & { href: string } => Boolean(item.href)),
);

export function isAppNavItemActive(item: AppNavItem, pathname: string) {
  if (!item.href) {
    return false;
  }

  const paths = [item.href, ...(item.aliases ?? [])];

  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "R";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ModuleItem({
  active,
  item,
  onNavigate,
}: {
  active: boolean;
  item: AppNavItem;
  onNavigate?: () => void;
}) {
  const content = (
    <>
      <item.icon className="size-4" />
      <span className="sr-only">{item.label}</span>
    </>
  );

  const className = cn(
    "flex size-9 items-center justify-center rounded-lg border text-muted-foreground transition-[background-color,border-color,color] duration-[160ms] ease-out",
    active
      ? "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground"
      : "border-sidebar-border bg-background/70 hover:border-border hover:bg-background hover:text-foreground",
    item.disabled && "cursor-not-allowed border-dashed opacity-45 hover:bg-background/70 hover:text-muted-foreground",
  );

  if (item.href && !item.disabled) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={className}
        title={item.label}
      >
        {content}
      </Link>
    );
  }

  return (
    <div aria-disabled className={className} title={item.label}>
      {content}
    </div>
  );
}

function TaskRailItem({
  item,
  pathname,
  onNavigate,
}: {
  item: AppNavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isAppNavItemActive(item, pathname);

  const content = (
    <>
      <item.icon
        className={cn(
          "size-4 shrink-0 text-muted-foreground",
          active && "text-primary",
        )}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm font-medium",
          active ? "text-foreground" : "text-foreground/90",
        )}
      >
        {item.label}
      </span>
      {item.disabled ? (
        <span className="rounded-sm border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Soon
        </span>
      ) : item.badge ? (
        <span className="text-xs font-medium text-muted-foreground">
          {item.badge}
        </span>
      ) : null}
    </>
  );

  const className = cn(
    "group flex min-h-10 items-center gap-2 rounded-sm border px-2.5 py-2 transition-[background-color,border-color,color] duration-[160ms] ease-out",
    active
      ? "border-sidebar-border bg-sidebar-accent"
      : "border-transparent bg-transparent hover:border-border/80 hover:bg-background/70",
    item.disabled && "cursor-not-allowed opacity-70 hover:border-transparent hover:bg-transparent",
  );

  if (item.href && !item.disabled) {
    return (
      <Link href={item.href} onClick={onNavigate} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div aria-disabled className={className}>
      {content}
    </div>
  );
}

type AppSidebarProps = {
  mobile?: boolean;
  pathname: string;
  userEmail: string;
  userName: string;
  onNavigate?: () => void;
};

export function AppModuleRail({
  pathname,
  userName,
}: {
  pathname: string;
  userName: string;
}) {
  const initials = getInitials(userName);
  const tasksActive = appNavItems.some((item) =>
    isAppNavItemActive(item, pathname),
  );

  return (
    <div className="flex h-screen flex-col items-center px-2 py-3">
      <Link
        href="/dashboard"
        className="flex size-9 items-center justify-center rounded-lg border border-sidebar-border bg-background text-sm font-semibold text-foreground"
        title="Open Today"
      >
        R
        <span className="sr-only">Open Today</span>
      </Link>

      <nav aria-label="Modules" className="mt-5 flex flex-col gap-2">
        {moduleNavItems.map((item) => (
          <ModuleItem
            key={item.label}
            active={!item.disabled && item.label === "Tasks" && tasksActive}
            item={item}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-full border border-border bg-background/80 text-xs font-semibold text-foreground"
          title={userName}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}

export function AppTaskRail({
  pathname,
  userEmail,
  userName,
  onNavigate,
}: AppSidebarProps) {
  const initials = getInitials(userName);

  return (
    <div className="flex h-full min-h-0 flex-col px-2.5 py-3">
      <div className="border-b border-sidebar-border px-2 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Tasks workspace
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-sidebar-foreground">
          Rythm
        </h2>
      </div>

      <nav
        aria-label="Tasks navigation"
        className="min-h-0 flex-1 space-y-5 overflow-y-auto px-1 py-4"
      >
        {taskNavGroups.map((group) => (
          <section key={group.label} className="space-y-2">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <TaskRailItem
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="space-y-3 border-t border-sidebar-border px-2 pt-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/80 text-xs font-semibold text-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {userName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-xs font-medium text-muted-foreground">
            Personal workspace
          </p>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

export function AppMobileNavigation({
  pathname,
  userEmail,
  userName,
  onNavigate,
}: AppSidebarProps) {
  const initials = getInitials(userName);

  return (
    <div className="flex h-full flex-col gap-4 bg-sidebar p-4">
      <div className="border-b border-sidebar-border pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Modules
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {moduleNavItems.map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-3 rounded-sm border border-border bg-background/80 px-3 py-3",
                item.disabled && "opacity-60",
              )}
            >
              <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/60 text-foreground">
                <item.icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  {item.disabled ? "Coming later" : item.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <nav aria-label="Tasks navigation" className="space-y-4">
        {taskNavGroups.map((group) => (
          <section key={group.label} className="space-y-2">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <TaskRailItem
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="mt-auto space-y-3 rounded-xl border border-sidebar-border bg-background/80 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full border border-border bg-muted/70 text-sm font-semibold text-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {userName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Scope
            </p>
            <p className="mt-1 text-sm text-foreground">Personal workspace</p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

export function AppSidebar(props: AppSidebarProps) {
  if (props.mobile) {
    return <AppMobileNavigation {...props} />;
  }

  return (
    <div className="grid h-full overflow-hidden rounded-lg border border-sidebar-border bg-sidebar shadow-xs lg:grid-cols-[4.25rem_minmax(0,1fr)]">
      <div className="border-r border-sidebar-border bg-sidebar/95">
        <AppModuleRail pathname={props.pathname} userName={props.userName} />
      </div>
      <AppTaskRail {...props} />
    </div>
  );
}
