"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpenText,
  CalendarDays,
  CheckSquare2,
  Clock3,
  History,
  Layers3,
  ListTodo,
  NotebookPen,
  Repeat2,
} from "lucide-react";

import { SignOutButton } from "@/components/app/sign-out-button";
import { getCategoryColor } from "@/lib/category-colors";
import { cn } from "@/lib/utils";
import type { AppNavGroup, AppNavItem } from "@/types/app";

type SidebarAttribute = {
  id: string;
  name: string;
  sortOrder: number;
};

type AttributesPayload = {
  attributes?: SidebarAttribute[];
};

export const moduleNavItems: AppNavItem[] = [
  {
    href: "/today",
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
        aliases: ["/dashboard"],
        href: "/today",
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
        aliases: ["/history"],
        href: "/activity-log",
        label: "Activity Log",
        summary: "Completion notes and correction flow.",
        icon: History,
      },
    ],
  },
  {
    label: "Spaces",
    items: [
      {
        aliases: ["/quests"],
        href: "/lists",
        label: "Lists",
        summary: "Task buckets and recurring definitions.",
        icon: ListTodo,
      },
      {
        aliases: ["/categories", "/habit-lists"],
        href: "/attributes",
        label: "Attributes",
        summary: "RPG-style life-domain containers.",
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

function useSidebarAttributes() {
  const [attributes, setAttributes] = useState<SidebarAttribute[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const response = await fetch("/api/attributes", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as AttributesPayload;
        const nextAttributes = [...(payload.attributes ?? [])].sort(
          (left, right) => left.sortOrder - right.sortOrder,
        );

        if (!cancelled) {
          setAttributes(nextAttributes);
        }
      } catch {
        if (!cancelled) {
          setAttributes([]);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  return attributes;
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
    "flex size-8 items-center justify-center rounded-lg border text-primary-foreground/60 transition-[background-color,border-color,color] duration-[160ms] ease-out",
    active
      ? "border-white/25 bg-white/15 text-primary-foreground"
      : "border-transparent hover:bg-white/10 hover:text-primary-foreground",
    item.disabled &&
      "cursor-not-allowed border-transparent text-primary-foreground/20 hover:bg-transparent hover:text-primary-foreground/20",
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

function RailLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  );
}

function RailDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-2 flex items-center gap-2 px-3">
      <span className="h-px flex-1 bg-sidebar-border" />
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        {children}
      </span>
      <span className="h-px flex-1 bg-sidebar-border" />
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
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[13px]",
          active ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
        )}
      >
        {item.label}
      </span>
      {item.disabled ? (
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Soon
        </span>
      ) : item.badge ? (
        <span
          className={cn(
            "font-mono text-[11px]",
            active ? "font-semibold text-primary" : "text-muted-foreground",
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </>
  );

  const className = cn(
    "flex min-h-8 items-center justify-between gap-2 border-r-2 px-3 py-1.5 transition-[background-color,border-color,color] duration-[160ms] ease-out",
    active
      ? "border-primary bg-accent text-foreground"
      : "border-transparent hover:bg-background/70 hover:text-foreground",
    item.disabled && "cursor-not-allowed opacity-55 hover:bg-transparent",
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

function AttributeRailItem({
  attribute,
  onNavigate,
}: {
  attribute: SidebarAttribute;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/attributes"
      onClick={onNavigate}
      className="flex min-h-7 items-center gap-2 border-r-2 border-transparent px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-[background-color,color] duration-[160ms] ease-out hover:bg-background/70 hover:text-foreground"
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: getCategoryColor(attribute.name) }}
      />
      <span className="truncate">{attribute.name}</span>
    </Link>
  );
}

function TaskRailNavigation({
  attributes,
  onNavigate,
  pathname,
}: {
  attributes: SidebarAttribute[];
  onNavigate?: () => void;
  pathname: string;
}) {
  const viewGroup = taskNavGroups[0];
  const taskSpaceGroup = taskNavGroups[1];

  return (
    <nav aria-label="Tasks navigation" className="min-h-0 flex-1 overflow-y-auto py-3">
      <RailLabel>{viewGroup.label}</RailLabel>
      <div>
        {viewGroup.items.map((item) => (
          <TaskRailItem
            key={item.label}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <RailDivider>Spaces</RailDivider>

      <div>
        {taskSpaceGroup.items.map((item) => (
          <TaskRailItem
            key={item.label}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <RailLabel>Attributes</RailLabel>
      <div>
        {attributes.length ? (
          attributes.map((attribute) => (
            <AttributeRailItem
              key={attribute.id}
              attribute={attribute}
              onNavigate={onNavigate}
            />
          ))
        ) : (
          <Link
            href="/attributes"
            onClick={onNavigate}
            className="flex min-h-7 items-center border-r-2 border-transparent px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-[background-color,color] duration-[160ms] ease-out hover:bg-background/70 hover:text-foreground"
          >
            Manage attributes
          </Link>
        )}
      </div>
    </nav>
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
  const tasksActive = appNavItems.some((item) =>
    isAppNavItemActive(item, pathname),
  );

  return (
    <div className="flex h-screen flex-col items-center px-2 py-3 text-primary-foreground">
      <Link
        href="/today"
        className="flex size-8 items-center justify-center rounded-lg bg-white/15 text-primary-foreground transition-colors duration-[160ms] ease-out hover:bg-white/20"
        title="Open Today"
      >
        <Clock3 className="size-4" />
        <span className="sr-only">Open Today</span>
      </Link>

      <nav aria-label="Modules" className="mt-4 flex flex-col gap-1.5">
        {moduleNavItems.map((item) => (
          <ModuleItem
            key={item.label}
            active={!item.disabled && item.label === "Tasks" && tasksActive}
            item={item}
          />
        ))}
      </nav>

      <div
        className="mt-auto flex size-8 items-center justify-center rounded-full bg-white/10 font-mono text-[10px] font-semibold text-primary-foreground/80"
        title={userName}
      >
        {getInitials(userName)}
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
  const attributes = useSidebarAttributes();
  const initials = getInitials(userName);

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar">
      <div className="border-b border-sidebar-border px-3 pb-3 pt-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Tasks workspace
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight text-sidebar-foreground">
          Rythm
        </h2>
      </div>

      <TaskRailNavigation
        attributes={attributes}
        pathname={pathname}
        onNavigate={onNavigate}
      />

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">
              {userName}
            </p>
            <p className="truncate font-mono text-[10px] text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
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
  const attributes = useSidebarAttributes();
  const initials = getInitials(userName);

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="bg-primary p-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
            <Clock3 className="size-4" />
          </div>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground/60">
              Tasks workspace
            </p>
            <p className="text-base font-semibold">Rythm</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {moduleNavItems.map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-white/15 bg-white/10 px-3 py-3",
                item.disabled && "opacity-45",
              )}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                <item.icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="truncate text-xs text-primary-foreground/60">
                  {item.disabled ? "Coming later" : item.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TaskRailNavigation
        attributes={attributes}
        pathname={pathname}
        onNavigate={onNavigate}
      />

      <div className="mt-auto border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
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

export function AppSidebar(props: AppSidebarProps) {
  if (props.mobile) {
    return <AppMobileNavigation {...props} />;
  }

  return (
    <div className="grid h-full overflow-hidden rounded-lg border border-sidebar-border bg-sidebar shadow-xs lg:grid-cols-[3rem_minmax(0,1fr)]">
      <div className="bg-primary">
        <AppModuleRail pathname={props.pathname} userName={props.userName} />
      </div>
      <AppTaskRail {...props} />
    </div>
  );
}
