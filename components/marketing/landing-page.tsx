import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  History,
  Menu,
  NotebookText,
  PanelsTopLeft,
  Trophy,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";

// ─── Data ─────────────────────────────────────────────────────────────────────

const navLinks = [
  { href: "#why", label: "Why it works" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const proofStats = [
  { label: "early access signups", value: "427" },
  { label: "week-4 active retention", value: "71%" },
  { label: "average beta satisfaction", value: "4.8 / 5" },
  { label: "countries in beta", value: "18" },
];

const problemCards = [
  {
    title: "Habit trackers get loud",
    body: "Streak pressure, badges, and daily guilt loops make the tool feel childish or exhausting instead of supportive.",
  },
  {
    title: "To-do apps get too broad",
    body: "Everything ends up mixed together, so recurring commitments disappear into a backlog built for tasks, not rhythm.",
  },
  {
    title: "Journals get too manual",
    body: "Useful for reflection, but they do not help you see today's repeatable commitments at a glance.",
  },
];

const features = [
  {
    icon: ClipboardList,
    title: "Today stays clear",
    body: "Open the app and see the current period, your progress, and the tasks that matter right now — not yesterday's guilt.",
  },
  {
    icon: CalendarRange,
    title: "Period-aware tasks",
    body: "Daily, weekly, monthly, and one-time tasks each live in the right cadence. Today's checklist stays relevant to the actual period.",
  },
  {
    icon: PanelsTopLeft,
    title: "Habit lists",
    body: "Group recurring commitments into habit lists like Health, Finance, or Spiritual so structure stays human and readable, not cluttered.",
  },
  {
    icon: NotebookText,
    title: "Completion notes",
    body: "Attach a short note to a check-off when context matters. Revisit it in the activity log without turning the app into a journal.",
  },
  {
    icon: History,
    title: "Honest activity log",
    body: "Review what actually happened, fix notes, and delete mistakes — without analytics theater to dress it up.",
  },
  {
    icon: Trophy,
    title: "Quiet progress",
    body: "XP, streak counts, and milestone badges surface as calm signals — honest and factual, never engineered to pressure or hook you.",
  },
];

const todayBullets = [
  "Sticky date and current-period context at the top",
  "Compact progress strip instead of a KPI wall",
  "Checklist rows grouped by habit list",
  "Notes stay close to the row, not buried in a separate route",
];

const structureBullets = [
  "Create and edit in-context — no bouncing to admin screens",
  "Search and cadence filters stay compact",
  "Starter habit lists to begin without blank-page anxiety",
  "Delete rules stay explicit when data dependencies exist",
];

const historyBullets = [
  "Grouped by day, readable like a log not a spreadsheet",
  "Notes and delete actions stay in the same view",
  "Filters exist but do not overpower the Activity Log itself",
];

const workflowSteps = [
  {
    number: "01",
    title: "Set your structure",
    body: "Create a few habit lists, add the recurring tasks that matter, and keep the system intentionally small at the beginning.",
  },
  {
    number: "02",
    title: "Move through today",
    body: "Open Today, see what belongs to this period, check it off. Add a note only when context actually matters.",
  },
  {
    number: "03",
    title: "Keep it honest",
    body: "Review the activity log, fix notes, remove mistakes. Rythm stays accurate as your real routines change.",
  },
];

/* prettier-ignore */
const comparisonRows: [string, string, string, string, string][] = [
  ["Period-aware recurring structure",       "Yes",        "Partial",          "Weak",     "Manual"],
  ["Low-noise, non-pressurizing daily flow", "Yes",        "Often no",         "Neutral",  "Yes"],
  ["Life-area grouping",                     "Yes",        "Basic",            "Possible", "Manual"],
  ["Completion notes",                       "Yes",        "Rare",             "Not core", "Yes"],
  ["Honest activity log",                    "Yes",        "Weak",             "Possible", "Manual"],
  ["Progress rewards (XP, badges)",          "Yes — quiet","Often aggressive", "No",       "No"],
  ["Installable mobile PWA",                 "Yes",        "Usually",          "Usually",  "No"],
];

const testimonials = [
  {
    quote:
      "I stopped bouncing between Todoist, a habit app, and a notes file. Rythm is the first one that feels quiet enough to keep opening every morning.",
    name: "Maya L.",
    role: "Product designer, Singapore",
  },
  {
    quote:
      "The weekly and monthly cadence makes more sense than forcing everything into a daily streak. It finally feels like a grown-up tool.",
    name: "Arif S.",
    role: "Independent consultant, Jakarta",
  },
  {
    quote:
      "I needed something that could hold health, work, and reflection without turning into a project board. This is the closest I have found.",
    name: "Elena P.",
    role: "Startup ops lead, Berlin",
  },
];

const pricingPlans: {
  name: string;
  price: string;
  description: string;
  cta: string;
  featured?: boolean;
  features: string[];
}[] = [
  {
    name: "Starter",
    price: "$0",
    description: "Free forever",
    cta: "Start free",
    features: [
      "Up to 12 active tasks",
      "Up to 4 habit lists",
      "Daily, weekly, monthly, and one-time tasks",
      "Basic streak tracking",
      "Mobile web access",
    ],
  },
  {
    name: "Ritual",
    price: "$8/mo",
    description: "Billed $96/year. $10 monthly equivalent.",
    featured: true,
    cta: "Start 14-day trial",
    features: [
      "Unlimited tasks and habit lists",
      "Full activity log and note editing",
      "XP, milestone badges, progress tracking",
      "Installable PWA experience",
      "Flexible filters and Activity Log review",
      "Priority feature feedback access",
    ],
  },
  {
    name: "Founding",
    price: "$149",
    description: "One-time early supporter price. Locked for life.",
    cta: "Become a founding member",
    features: [
      "Everything in Ritual",
      "Locked founding-member pricing",
      "Early roadmap access",
      "Private feedback channel",
      "Priority onboarding support",
    ],
  },
];

const faqItems = [
  {
    question: "Is this just another habit tracker?",
    answer:
      "No. Most habit trackers push daily streaks, notifications, and social comparison. Rythm is a period-aware task system — daily, weekly, monthly, or one-time — where you define the structure and it quietly tracks your consistency.",
  },
  {
    question: "Does Rythm have gamification?",
    answer:
      "Yes, but it stays quiet. There is XP for completions and milestone badges — honest signals of consistency, not engagement tricks. No fire emojis, no leaderboards, no notification pressure designed to manufacture urgency.",
  },
  {
    question: "Can I use it for both work and personal routines?",
    answer:
      "Yes. The habit-list model is deliberately broad. Health, Finance, Career, Spiritual, Relationships — whatever groupings reflect your actual life. Nothing forces a separation.",
  },
  {
    question: "Do I need to write notes every day?",
    answer:
      "No. Notes are optional and tied to individual completions. The product stays fast when you just want to check something done and move on.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "Yes. Rythm is designed mobile-first and can be installed as a PWA from your phone's browser — no separate native app needed.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Partially. The app shell loads offline, but writes and Activity Log updates need a live connection. That limitation is intentional — Rythm does not promise background sync it cannot reliably deliver.",
  },
  {
    question: "Is there a team or household plan?",
    answer:
      "Not yet. Rythm is built as a personal system first. A shared version is possible later, but not a vague promise on a roadmap slide.",
  },
  {
    question: "Who is Rythm not for?",
    answer:
      "People who want a highly social tool, a Notion-style second brain, or enterprise project management. Rythm is strongest when the goal is calm personal consistency over time.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  );
}

function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-20 py-16 sm:py-20 ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

function Box({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`landing-card border border-border/70 p-5 shadow-sm [border-radius:var(--radius-lg)] ${className}`}
    >
      {children}
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── App mockups for deep-dive sections ───────────────────────────────────────

function TodayMockup() {
  const items = [
    {
      done: true,
      title: "Morning stretch",
      meta: "Fitness · Daily · streak 12",
    },
    {
      done: true,
      title: "Hydrate before coffee",
      meta: "Health · Daily · streak 7",
    },
    { done: false, title: "Money review", meta: "Finance · Weekly" },
    { done: false, title: "Check savings rate", meta: "Finance · Monthly" },
  ];
  return (
    <div className="landing-card overflow-hidden border border-border/70 shadow-md [border-radius:var(--radius-xl)]">
      <div className="landing-mini-panel m-3 overflow-hidden border border-border/60 [border-radius:var(--radius-lg)]">
        <div className="flex items-start justify-between border-b border-border/60 bg-background px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Today
            </p>
            <p className="mt-0.5 text-sm font-semibold">Tuesday, Mar 12</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="size-3 text-primary" />
              <span className="font-semibold text-foreground">480</span> XP
            </span>
            <div className="text-right">
              <p>3 / 5</p>
              <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-3/5 bg-primary" />
              </div>
            </div>
          </div>
        </div>
        {items.map((item, i) => (
          <div
            key={item.title}
            className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 bg-background px-4 py-3 ${
              i < items.length - 1 ? "border-b border-border/60" : ""
            }`}
          >
            <span
              className={`flex size-6 items-center justify-center border [border-radius:var(--radius-sm)] ${
                item.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background"
              }`}
            >
              <CheckCircle2 className="size-3" />
            </span>
            <div>
              <p className="text-xs font-medium">{item.title}</p>
              <p className="text-[10px] text-muted-foreground">{item.meta}</p>
            </div>
            <span
              className={`text-[10px] uppercase tracking-[0.1em] ${
                item.done ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.done ? "Done" : "Open"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StructureMockup() {
  const categories = [
    {
      name: "Fitness",
      count: 3,
      open: true,
      quests: ["Morning stretch", "Evening walk", "Hydration goal"],
    },
    { name: "Finance", count: 2, open: false, quests: [] },
    { name: "Learning", count: 4, open: false, quests: [] },
  ];
  return (
    <div className="landing-card overflow-hidden border border-border/70 shadow-md [border-radius:var(--radius-xl)]">
      <div className="landing-mini-panel m-3 overflow-hidden border border-border/60 [border-radius:var(--radius-lg)]">
        <div className="border-b border-border/60 bg-background px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Habit Lists
          </p>
          <p className="mt-0.5 text-sm font-semibold">
            3 habit lists · 9 tasks
          </p>
        </div>
        {categories.map((cat, i) => (
          <div
            key={cat.name}
            className={i > 0 ? "border-t border-border/60" : ""}
          >
            <div className="flex items-center justify-between bg-background px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{cat.name}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {cat.count}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground/50">
                {cat.open ? "▾" : "▸"}
              </span>
            </div>
            {cat.open &&
              cat.quests.map((q) => (
                <div
                  key={q}
                  className="flex items-center gap-2.5 border-t border-border/50 bg-muted/30 px-5 py-2"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-primary/50" />
                  <p className="text-xs text-muted-foreground">{q}</p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryMockup() {
  return (
    <div className="landing-card overflow-hidden border border-border/70 shadow-md [border-radius:var(--radius-xl)]">
      <div className="landing-mini-panel m-3 overflow-hidden border border-border/60 [border-radius:var(--radius-lg)]">
        <div className="border-b border-border/60 bg-background px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Activity Log
          </p>
          <p className="mt-0.5 text-sm font-semibold">March 2025</p>
        </div>
        <div className="bg-muted/40 px-4 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Tuesday, Mar 12
          </p>
        </div>
        {[
          {
            title: "Morning stretch",
            meta: "Fitness · Daily",
            note: "Felt harder, still done.",
          },
          { title: "Hydrate before coffee", meta: "Health · Daily", note: "" },
        ].map((item, i) => (
          <div
            key={item.title}
            className={`bg-background px-4 py-2.5 ${i === 0 ? "border-b border-border/60" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.meta}</p>
                {item.note && (
                  <p className="mt-1 text-[10px] italic text-muted-foreground/70">
                    &ldquo;{item.note}&rdquo;
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[10px] font-medium text-primary">
                Done
              </span>
            </div>
          </div>
        ))}
        <div className="border-t border-border/60 bg-muted/40 px-4 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Monday, Mar 11
          </p>
        </div>
        {[
          { title: "Morning stretch", meta: "Fitness · Daily" },
          { title: "Money review", meta: "Finance · Weekly" },
        ].map((item, i) => (
          <div
            key={item.title}
            className={`bg-background px-4 py-2.5 ${i === 0 ? "border-b border-border/60" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.meta}</p>
              </div>
              <span className="shrink-0 text-[10px] font-medium text-primary">
                Done
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <main className="landing-shell min-h-screen text-foreground">
      <div className="landing-grid">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="text-sm font-bold uppercase tracking-[0.22em] text-foreground"
            >
              Rythm
            </Link>

            <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Start free</Link>
              </Button>
              <details className="group relative md:hidden">
                <summary
                  aria-label="Open navigation"
                  className="flex size-9 cursor-pointer list-none items-center justify-center border border-border bg-background shadow-sm [border-radius:var(--radius-sm)] [&::-webkit-details-marker]:hidden"
                >
                  <Menu className="size-4" />
                </summary>
                <nav className="landing-card absolute right-0 mt-2 grid w-52 gap-0.5 border border-border/70 p-1.5 shadow-lg [border-radius:var(--radius-md)]">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground [border-radius:var(--radius-sm)]"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </details>
            </div>
          </div>
        </header>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="flex min-h-[calc(100svh-65px)] flex-col px-4 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            <div className="landing-enter mx-auto max-w-4xl py-4 text-center">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Build a rhythm you can actually keep.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Rythm turns recurring commitments into period-aware tasks so
                you can see today clearly, track progress honestly, and build
                consistency without habit-tracker pressure.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-7 text-base">
                  <Link href="/sign-up">
                    Start free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 px-7 text-base"
                >
                  <a href="#how">See how it works</a>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground/70">
                No card needed · Desktop and mobile · Installable PWA
              </p>
            </div>

            {/* App shell preview */}
            <div
              aria-label="Product preview"
              className="landing-enter mx-auto mt-auto flex w-full max-w-6xl flex-col overflow-hidden border-x border-t border-border/70 bg-card text-left shadow-xl [border-radius:var(--radius-lg)_var(--radius-lg)_0_0]"
            >
              {/* Browser chrome */}
              <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-primary/80" />
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="size-2.5 rounded-full bg-border" />
                </div>
                <p className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:block">
                  Rythm · Tasks · Today
                </p>
                <div className="hidden w-[60px] sm:block" />
              </div>

              {/* Three-column shell */}
              <div className="grid min-h-72 md:min-h-80 md:grid-cols-[1fr_15rem] lg:grid-cols-[11rem_1fr_15rem]">
                {/* Sidebar */}
                <aside className="hidden border-r border-border/70 bg-muted/40 p-3 lg:block">
                  <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Tasks
                  </p>
                  <div className="mt-2 space-y-0.5">
                    {["Today", "Upcoming", "Calendar", "Activity Log"].map(
                      (item, i) => (
                        <div
                          key={item}
                          className={`flex items-center justify-between px-2 py-1.5 text-xs [border-radius:var(--radius-sm)] ${
                            i === 0
                              ? "border border-border/70 bg-background font-semibold text-foreground"
                              : "text-muted-foreground/70"
                          }`}
                        >
                          <span>{item}</span>
                          <span>{i === 0 ? "5" : "–"}</span>
                        </div>
                      ),
                    )}
                  </div>
                  <div className="mt-4 border-t border-border/60 pt-3">
                    <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Spaces
                    </p>
                    <div className="mt-2 space-y-0.5 text-xs text-muted-foreground/70">
                      <div className="flex justify-between px-2 py-1.5">
                        <span>Lists</span>
                        <span>12</span>
                      </div>
                      <div className="flex justify-between px-2 py-1.5">
                        <span>Habit Lists</span>
                        <span>6</span>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Main */}
                <div className="border-r border-border/70 bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Today
                      </p>
                      <h2 className="mt-1 text-xl font-semibold">
                        Tuesday, Mar 12
                      </h2>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Zap className="size-3.5 text-primary" />
                        <span className="font-semibold text-foreground">
                          480
                        </span>{" "}
                        XP
                      </span>
                      <div>
                        <div className="flex justify-between">
                          <span>3 / 5 done</span>
                        </div>
                        <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-[var(--radius-sm)] bg-muted">
                          <div className="h-full w-3/5 bg-primary" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden border border-border/60 [border-radius:var(--radius-md)]">
                    {[
                      {
                        done: true,
                        title: "Morning stretch",
                        meta: "Habit list: Fitness · Daily · streak 12",
                      },
                      {
                        done: true,
                        title: "Hydrate before coffee",
                        meta: "Habit list: Health · Daily · streak 7",
                      },
                      {
                        done: false,
                        title: "Fix onboarding copy",
                        meta: "List: Product · Due today",
                      },
                      {
                        done: false,
                        title: "Money review",
                        meta: "Habit list: Finance · Weekly",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border/60 px-4 py-3 last:border-b-0"
                      >
                        <span
                          className={`flex size-7 items-center justify-center border [border-radius:var(--radius-sm)] ${
                            item.done
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          <CheckCircle2 className="size-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">
                            {item.title}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {item.meta}
                          </p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                          {item.done ? "Done" : "Open"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail pane */}
                <aside className="hidden bg-muted/25 p-4 md:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Detail
                  </p>
                  <div className="mt-3 space-y-3">
                    <div className="border border-border/70 bg-background p-3 [border-radius:var(--radius-md)]">
                      <p className="text-sm font-semibold">Morning stretch</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Fitness · Daily
                      </p>
                      <p className="mt-3 text-xs leading-6 text-muted-foreground">
                        Felt harder than usual, but still done before work.
                      </p>
                    </div>
                    <div className="border border-border/70 bg-background p-3 [border-radius:var(--radius-md)]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Current streak
                      </p>
                      <p className="mt-2 text-2xl font-semibold">12 days</p>
                    </div>
                    <div className="border border-border/70 bg-background p-3 [border-radius:var(--radius-md)]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Progress
                      </p>
                      <p className="mt-1 text-lg font-semibold">480 XP</p>
                      <p className="text-xs text-muted-foreground">
                        Next milestone: 500
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        {/* ── Proof stats ────────────────────────────────────────────────── */}
        <Section>
          <div className="overflow-hidden border border-border/70 bg-background/80 shadow-sm [border-radius:var(--radius-lg)]">
            <div className="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
              {proofStats.map((stat) => (
                <div key={stat.label} className="px-6 py-6">
                  <p className="text-3xl font-semibold">{stat.value}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground/60">
            Placeholder proof metrics — replace with real data before launch.
          </p>
        </Section>

        {/* ── Problem ────────────────────────────────────────────────────── */}
        <Section id="why">
          <SectionLabel>The problem</SectionLabel>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Most personal productivity tools break the moment life stops being
            neat.
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {problemCards.map((card) => (
              <Box key={card.title}>
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {card.body}
                </p>
              </Box>
            ))}
          </div>
        </Section>

        {/* ── Pivot ──────────────────────────────────────────────────────── */}
        <Section className="text-center">
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Rythm gives you a quieter way to keep promises to yourself.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            One daily view. Real recurring structure. Enough review to stay
            honest. No performance theater.
          </p>
          <div className="mx-auto mt-8 flex flex-wrap justify-center gap-2">
            {[
              "Calm daily view",
              "Honest streaks",
              "Quiet XP",
              "Life-area structure",
              "Editable log",
            ].map((label) => (
              <span
                key={label}
                className="border border-border/70 bg-background px-3 py-1.5 text-xs text-muted-foreground [border-radius:var(--radius-sm)]"
              >
                {label}
              </span>
            ))}
          </div>
          <Button asChild className="mt-6" size="lg" variant="outline">
            <a href="#how">See the workflow</a>
          </Button>
        </Section>

        {/* ── Features ───────────────────────────────────────────────────── */}
        <Section>
          <SectionLabel>Core features</SectionLabel>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Everything exists to support one idea: daily clarity with long-term
            honesty.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Box key={feature.title}>
                  <div className="flex size-9 items-center justify-center border border-border/60 bg-background [border-radius:var(--radius-sm)]">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {feature.body}
                  </p>
                </Box>
              );
            })}
          </div>
        </Section>

        {/* ── Deep dive: Today ───────────────────────────────────────────── */}
        <Section>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionLabel>Deep dive</SectionLabel>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Open once. Know what matters.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                The Today view is built for one question: what belongs to this
                period, and what can I check right now?
              </p>
              <div className="mt-6">
                <CheckList items={todayBullets} />
              </div>
            </div>
            <TodayMockup />
          </div>
        </Section>

        {/* ── Deep dive: Structure ───────────────────────────────────────── */}
        <Section>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <StructureMockup />
            <div>
              <SectionLabel>Deep dive</SectionLabel>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Structure without spreadsheet chaos.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Add tasks, group them into habit lists, reorder, and keep setup
                close to the list instead of bouncing through admin screens.
              </p>
              <div className="mt-6">
                <CheckList items={structureBullets} />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Deep dive: History ─────────────────────────────────────────── */}
        <Section>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionLabel>Deep dive</SectionLabel>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                A system you can review without rewriting your life.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                The activity log is not there to impress you with analytics. It
                is there to help you review, correct, and keep the system
                honest.
              </p>
              <div className="mt-6">
                <CheckList items={historyBullets} />
              </div>
            </div>
            <HistoryMockup />
          </div>
        </Section>

        {/* ── How it works ───────────────────────────────────────────────── */}
        <Section id="how">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            You do not need to build a second brain to get value.
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {workflowSteps.map((step) => (
              <Box key={step.number}>
                <span className="inline-flex bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground [border-radius:var(--radius-sm)]">
                  {step.number}
                </span>
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {step.body}
                </p>
              </Box>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Section>

        {/* ── Comparison ─────────────────────────────────────────────────── */}
        <Section>
          <SectionLabel>How it compares</SectionLabel>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Rythm sits between a habit app, a to-do list, and a journal.
          </h2>
          <div className="mt-8 overflow-x-auto border border-border/70 bg-background/80 shadow-sm [border-radius:var(--radius-lg)]">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-muted/60 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Capability
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Rythm
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Habit tracker
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    To-do app
                  </th>
                  <th className="px-4 py-3 font-semibold" scope="col">
                    Journal
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row[0]}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <td className="px-4 py-3.5">{row[0]}</td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">
                      {row[1]}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {row[2]}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {row[3]}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {row[4]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Testimonials ───────────────────────────────────────────────── */}
        <Section>
          <SectionLabel>Early proof</SectionLabel>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            People do not need more motivation. They need a system they can
            return to.
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Box key={t.name}>
                <p className="text-sm leading-7 text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </Box>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground/60">
            Placeholder testimonials — replace with real users before launch.
          </p>
        </Section>

        {/* ── Pricing ────────────────────────────────────────────────────── */}
        <Section id="pricing">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Simple plans. Honest pricing.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            Placeholder pricing — exact numbers will be set before launch. The
            structure below reflects the intended tier shape.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Box
                key={plan.name}
                className={plan.featured ? "border-primary shadow-lg" : ""}
              >
                {plan.featured ? (
                  <span className="inline-flex bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground [border-radius:var(--radius-sm)]">
                    Recommended
                  </span>
                ) : null}
                <h3
                  className={`text-2xl font-semibold ${plan.featured ? "mt-5" : ""}`}
                >
                  {plan.name}
                </h3>
                <p className="mt-3 text-4xl font-semibold">{plan.price}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="my-6 border-t border-border/70" />
                <CheckList items={plan.features} />
                <Button
                  asChild
                  className="mt-7 w-full"
                  variant={plan.featured ? "default" : "outline"}
                >
                  <Link href="/sign-up">{plan.cta}</Link>
                </Button>
              </Box>
            ))}
          </div>
        </Section>

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        <Section id="faq">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Common questions, honest answers.
          </h2>
          <div className="mt-8 space-y-2">
            {faqItems.map((item, i) => (
              <details
                key={item.question}
                className="group landing-card border border-border/70 px-5 py-4 shadow-sm [border-radius:var(--radius-lg)]"
                open={i === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span className="shrink-0 text-lg leading-none text-muted-foreground group-open:hidden">
                    +
                  </span>
                  <span className="hidden shrink-0 text-lg leading-none text-muted-foreground group-open:inline">
                    −
                  </span>
                </summary>
                <p className="mt-3.5 max-w-3xl text-sm leading-7 text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </Section>

        {/* ── Final CTA ──────────────────────────────────────────────────── */}
        <Section className="text-center">
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            If you want more structure without more noise, start here.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            The right first impression is not intensity. It is relief.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-up">Start free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how">See how it works</a>
            </Button>
          </div>
        </Section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="border-t border-border/70 py-10">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 text-sm sm:px-6 md:grid-cols-4 lg:px-8">
            <div>
              <p className="font-bold uppercase tracking-[0.18em]">Rythm</p>
              <p className="mt-3 text-muted-foreground">
                Personal rhythm for recurring life commitments.
              </p>
            </div>
            <div>
              <p className="font-semibold">Product</p>
              <div className="mt-3 grid gap-2 text-muted-foreground">
                <a
                  className="transition-colors hover:text-foreground"
                  href="#why"
                >
                  Why it works
                </a>
                <a
                  className="transition-colors hover:text-foreground"
                  href="#pricing"
                >
                  Pricing
                </a>
                <a
                  className="transition-colors hover:text-foreground"
                  href="#faq"
                >
                  FAQ
                </a>
              </div>
            </div>
            <div>
              <p className="font-semibold">Account</p>
              <div className="mt-3 grid gap-2 text-muted-foreground">
                <Link
                  className="transition-colors hover:text-foreground"
                  href="/sign-in"
                >
                  Sign in
                </Link>
                <Link
                  className="transition-colors hover:text-foreground"
                  href="/sign-up"
                >
                  Create account
                </Link>
              </div>
            </div>
            <div>
              <p className="font-semibold">Legal</p>
              <div className="mt-3 grid gap-2 text-muted-foreground">
                <span>Privacy</span>
                <span>Terms</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
