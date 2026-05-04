import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  History,
  Menu,
  NotebookText,
  PanelsTopLeft,
  Smartphone,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "#why", label: "Why it works" },
  { href: "#workflow", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const proofStats = [
  { label: "early access signups", value: "427" },
  { label: "week-4 active retention", value: "71%" },
  { label: "average beta satisfaction", value: "4.8 / 5" },
  { label: "beta users so far", value: "18 countries" },
];

const problemCards = [
  {
    body: "Streak pressure, badges, and daily guilt loops can make the tool feel childish or exhausting instead of supportive.",
    title: "Habit trackers get loud",
  },
  {
    body: "Everything ends up mixed together, so recurring commitments disappear into a backlog built for tasks, not rhythm.",
    title: "To-do apps get too broad",
  },
  {
    body: "They are useful for reflection, but they do not help you see today's repeatable commitments at a glance.",
    title: "Journals get too manual",
  },
];

const featureCards = [
  {
    body: "Open the app and see the current period, your visible progress, and the quests that actually matter right now.",
    icon: ClipboardList,
    title: "Today stays clear",
  },
  {
    body: "Mix daily, weekly, monthly, and main quests in one calm system instead of forcing everything into one streak model.",
    icon: Target,
    title: "Period-aware quests",
  },
  {
    body: "Group recurring commitments into categories like Health, Focus, Money, or Spiritual so structure stays human and readable.",
    icon: PanelsTopLeft,
    title: "Life areas",
  },
  {
    body: "Attach a short note to a real completion when context matters, without turning the app into a journal.",
    icon: NotebookText,
    title: "Notes that matter",
  },
  {
    body: "Review what actually happened, edit notes, and remove mistaken completions without losing the surrounding context.",
    icon: History,
    title: "History you can trust",
  },
  {
    body: "Use the same focused flow on desktop or install it as a PWA on your phone when you need a lighter daily ritual.",
    icon: Smartphone,
    title: "Mobile-ready rhythm",
  },
];

const todayBullets = [
  "Sticky date and current-period context",
  "Compact progress strip instead of a KPI dashboard wall",
  "Checklist rows grouped by category",
  "Notes close to the quest row, not hidden in another route",
];

const structureBullets = [
  "Search and filters stay compact",
  "Create and edit happen in-context",
  "Starter pack helps new users begin fast",
  "Delete rules stay explicit when data dependencies exist",
];

const historyBullets = [
  "Grouped by day, not trapped in a dense table",
  "Notes and delete actions stay in the same context",
  "Filters exist, but they do not overpower the archive itself",
];

const workflowSteps = [
  {
    body: "Create a few life areas, add the recurring quests that matter, and keep the system intentionally small at the beginning.",
    number: "01",
    title: "Set your structure",
  },
  {
    body: "Open Today, check what belongs to this period, and add a note only when context actually matters.",
    number: "02",
    title: "Move through today",
  },
  {
    body: "Review history, edit notes, and remove mistakes when your archive needs correction, not perfection theater.",
    number: "03",
    title: "Keep it honest",
  },
];

const comparisonRows = [
  ["Period-aware recurring structure", "Yes", "Partial", "Weak", "Manual"],
  [
    "Low-noise, non-pressurizing daily flow",
    "Yes",
    "Often no",
    "Neutral",
    "Yes",
  ],
  ["Life-area grouping", "Yes", "Basic", "Possible", "Manual"],
  ["Completion notes tied to real events", "Yes", "Rare", "Not core", "Yes"],
  ["Archive correction without chaos", "Yes", "Weak", "Possible", "Manual"],
  ["Installable mobile-friendly flow", "Yes", "Usually", "Usually", "No"],
];

const testimonials = [
  {
    attribution: "Maya L. - Product designer, Singapore",
    quote:
      "I stopped bouncing between Todoist, a habit app, and a notes file. Rythm is the first one that feels quiet enough to keep opening every morning.",
  },
  {
    attribution: "Arif S. - Independent consultant, Jakarta",
    quote:
      "The weekly and monthly cadence makes more sense than forcing everything into a daily streak. It finally feels like a grown-up tool.",
  },
  {
    attribution: "Elena P. - Startup ops lead, Berlin",
    quote:
      "I needed something that could hold health, work, and reflection without turning into a project board. This is the closest I have found.",
  },
];

const testimonialStats = [
  { label: "week-4 retention in beta", value: "71%" },
  { label: "placeholder completed quests in beta", value: "12.4k" },
  { label: "average beta rating", value: "4.8 / 5" },
];

const pricingPlans = [
  {
    cta: "Start free",
    description: "Free forever",
    features: [
      "Up to 12 active quests",
      "Up to 4 categories",
      "Daily, weekly, monthly, and main quests",
      "Basic streaks",
      "Mobile web access",
    ],
    name: "Starter",
    price: "$0",
  },
  {
    cta: "Start 14-day trial",
    description: "Placeholder annual price. $10 monthly equivalent.",
    featured: true,
    features: [
      "Unlimited active quests",
      "Unlimited categories",
      "Full history and note editing",
      "Flexible filters and archive review",
      "Installable PWA experience",
      "Priority feature feedback access",
    ],
    name: "Ritual",
    price: "$8/mo",
  },
  {
    cta: "Become a founding member",
    description: "Placeholder one-time early supporter price",
    features: [
      "Everything in Ritual",
      "Locked founding-member pricing",
      "Early roadmap access",
      "Private feedback channel",
      "Priority onboarding support",
    ],
    name: "Founding",
    price: "$149",
  },
];

const faqItems = [
  {
    answer:
      "No. Rythm is built around recurring life commitments, not aggressive streak pressure or social gamification mechanics. It does use light progress signals as honest milestones, but they stay quiet and factual.",
    question: "Is this just another habit tracker?",
  },
  {
    answer:
      "Yes. The category model is deliberately broad, so you can hold Health, Focus, Finance, Relationships, or Work in one structure without turning it into a project board.",
    question: "Can I use it for work and personal routines together?",
  },
  {
    answer:
      "No. Notes are optional and tied to completions. The product still feels fast when you only want to check something done and move on.",
    question: "Do I need to write notes every day?",
  },
  {
    answer:
      "Yes. The product is designed mobile-first and can be installed as a PWA so the daily ritual works on your phone without a separate app stack.",
    question: "Does it work on mobile?",
  },
  {
    answer:
      "Partially. The shell can reopen offline, but live writes and history updates still need a connection.",
    question: "Does it work offline?",
  },
  {
    answer:
      "Not in the current product scope yet. For launch, the strongest path is a quick manual setup or a starter structure.",
    question: "Can I import my current habits from another tool?",
  },
  {
    answer:
      "Not in the current product scope. Rythm is designed as a personal system first.",
    question: "Is there a team or household plan?",
  },
  {
    answer:
      "Placeholder answer for now: export should exist on a paid tier, but the exact format and scope can be finalized later.",
    question: "Can I export my data?",
  },
  {
    answer:
      "Still being finalized. The pricing section is a placeholder anchor so the page has a believable commercial frame before market validation is complete.",
    question: "What will pricing actually be?",
  },
  {
    answer:
      "It is probably not for people who want a highly social, aggressively gamified, or enterprise-style productivity tool.",
    question: "Who is Rythm not for?",
  },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  );
}

function LandingSection({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 border-t border-border/70 py-20 sm:py-24 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

function CardBox({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`landing-card border border-border/70 p-5 shadow-sm backdrop-blur-[1px] [border-radius:var(--radius-lg)] ${className}`}
    >
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
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

function ScreenshotMock({ label, title }: { label: string; title: string }) {
  return (
    <div className="landing-card border border-border/70 p-4 shadow-md [border-radius:var(--radius-xl)]">
      <div className="landing-mini-panel min-h-80 border border-border/60 p-4 [border-radius:var(--radius-lg)]">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-xl font-semibold">{title}</p>
          </div>
          <span className="text-xs text-muted-foreground">Preview</span>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-8 w-2/3 bg-muted [border-radius:var(--radius-sm)]" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-20 border border-border bg-background/80 [border-radius:var(--radius-sm)]" />
            <div className="h-20 border border-border bg-background/80 [border-radius:var(--radius-sm)]" />
            <div className="h-20 border border-border bg-background/80 [border-radius:var(--radius-sm)]" />
          </div>
          <div className="space-y-2">
            <div className="h-12 border border-border bg-background/80 [border-radius:var(--radius-sm)]" />
            <div className="h-12 border border-border bg-background/80 [border-radius:var(--radius-sm)]" />
            <div className="h-12 border border-border bg-background/80 [border-radius:var(--radius-sm)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="landing-shell min-h-screen text-foreground">
      <div className="landing-grid">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="text-sm font-extrabold uppercase tracking-[0.18em] text-foreground"
            >
              Rythm
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
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
                  className="flex size-9 cursor-pointer list-none items-center justify-center border border-border bg-background text-foreground shadow-sm [border-radius:var(--radius-sm)] [&::-webkit-details-marker]:hidden"
                >
                  <Menu className="size-4" />
                </summary>
                <div className="landing-card absolute right-0 mt-3 grid w-48 gap-1 border border-border/70 p-2 text-sm shadow-lg [border-radius:var(--radius-md)]">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </header>

        <section className="flex min-h-[calc(100svh-73px)] px-4 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 text-center sm:gap-10">
            <div className="landing-enter mx-auto max-w-5xl py-8 sm:py-10">
              <h1 className="mx-auto max-w-5xl text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                A quieter way to keep recurring commitments clear.
              </h1>
              <p className="mx-auto mt-4 max-w-4xl text-base leading-8 text-foreground/85 sm:text-lg">
                Rythm turns recurring goals into period-aware quests, so you can
                see what matters today, keep short notes when context matters,
                and review your history without turning your life into a game.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-14 px-8 text-base font-bold sm:text-lg"
                  size="lg"
                >
                  <Link href="/sign-up">
                    Start free
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-14 px-8 text-base font-bold sm:text-lg"
                  size="lg"
                  variant="outline"
                >
                  <a href="#workflow">See how it works</a>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                No card needed / Works on desktop and phone / Placeholder
                pricing until launch
              </p>
            </div>

            <div
              aria-label="Product preview"
              className="landing-enter mx-auto mt-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden border-x border-t border-border/70 bg-card text-left shadow-xl rounded-t-lg"
            >
              <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-primary/80" />
                  <span className="size-2.5 rounded-full bg-muted-foreground/35" />
                  <span className="size-2.5 rounded-full bg-border" />
                </div>
                <p className="hidden text-xs font-semibold uppercase text-muted-foreground sm:block">
                  Rythm / Tasks / Today
                </p>
              </div>

              <div className="grid min-h-[18rem] flex-1 md:min-h-[21rem] md:grid-cols-[1fr_16rem] lg:grid-cols-[12rem_1fr_16rem]">
                <aside className="hidden border-r border-border/70 bg-muted/45 p-4 lg:block">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Tasks
                  </p>
                  <div className="mt-4 space-y-2">
                    {["Today", "Upcoming", "Calendar", "Activity Log"].map(
                      (item, index) => (
                        <div
                          key={item}
                          className={`flex items-center justify-between px-3 py-2 text-sm [border-radius:var(--radius-sm)] ${
                            index === 0
                              ? "border border-border bg-background font-semibold text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span>{item}</span>
                          <span className="text-xs">
                            {index === 0 ? "5" : "--"}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                  <div className="mt-5 border-t border-border/70 pt-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Spaces
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between px-3 py-2">
                        <span>Lists</span>
                        <span>12</span>
                      </div>
                      <div className="flex justify-between px-3 py-2">
                        <span>Habit Lists</span>
                        <span>6</span>
                      </div>
                    </div>
                  </div>
                </aside>

                <div className="bg-background p-4 md:border-r md:border-border/70">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Today
                      </p>
                      <h2 className="mt-1 text-2xl font-bold">
                        Tuesday, Mar 12
                      </h2>
                    </div>
                    <div className="min-w-36">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>3 / 5</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden bg-muted [border-radius:var(--radius-sm)]">
                        <div className="h-full w-3/5 bg-primary" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                      Morning rhythm
                    </p>
                    <div className="overflow-hidden border border-border/70 [border-radius:var(--radius-md)]">
                      {[
                        {
                          done: true,
                          meta: "Habit list: Daily Schedule / Daily / streak 12",
                          status: "Done",
                          title: "Morning Stretch",
                        },
                        {
                          done: true,
                          meta: "Habit list: Health / Daily / streak 7",
                          status: "Done",
                          title: "Hydrate before coffee",
                        },
                        {
                          done: false,
                          meta: "List: Product / Due today",
                          status: "Open",
                          title: "Fix onboarding copy",
                        },
                        {
                          done: false,
                          meta: "Habit list: Finance / Weekly",
                          status: "Open",
                          title: "Money review",
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border/60 px-4 py-3 last:border-b-0"
                        >
                          <span
                            className={`flex size-8 items-center justify-center border [border-radius:var(--radius-sm)] ${
                              item.done
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground"
                            }`}
                          >
                            <CheckCircle2 className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {item.title}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.meta}
                            </p>
                          </div>
                          <span className="text-xs uppercase text-muted-foreground">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <aside className="hidden bg-muted/30 p-4 md:block">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Note context
                  </p>
                  <div className="mt-4 border border-border/70 bg-background p-4 [border-radius:var(--radius-md)]">
                    <p className="text-sm font-semibold">Morning Stretch</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Fitness / Daily
                    </p>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      Felt harder than usual, but still done before work.
                    </p>
                  </div>
                  <div className="mt-4 border border-border/70 bg-background p-4 [border-radius:var(--radius-md)]">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Current streak
                    </p>
                    <p className="mt-2 text-3xl font-bold">12 days</p>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        <LandingSection>
          <div
            aria-label="Early proof metrics"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {proofStats.map((stat) => (
              <CardBox key={stat.label}>
                <p className="text-3xl font-extrabold">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </CardBox>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Placeholder proof. Replace with real data later.
          </p>
        </LandingSection>

        <LandingSection id="why">
          <SectionLabel>The problem</SectionLabel>
          <h2 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight">
            Most personal productivity tools break the moment life stops being
            neat.
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {problemCards.map((card) => (
              <CardBox key={card.title} className="min-h-48">
                <h3 className="text-xl font-bold">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {card.body}
                </p>
              </CardBox>
            ))}
          </div>
        </LandingSection>

        <LandingSection className="text-center">
          <h2 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight">
            Rythm gives you a quieter way to keep promises to yourself.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
            One daily view. Real recurring structure. Enough history to stay
            honest. No performance theater.
          </p>
          <Button asChild className="mt-7" size="lg" variant="outline">
            <a href="#workflow">See the workflow</a>
          </Button>
        </LandingSection>

        <LandingSection>
          <SectionLabel>Core features</SectionLabel>
          <h2 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight">
            Everything on the page should support one idea: daily clarity with
            long-term honesty.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <CardBox key={feature.title} className="min-h-52">
                  <Icon className="size-6 text-primary" />
                  <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {feature.body}
                  </p>
                </CardBox>
              );
            })}
          </div>
        </LandingSection>

        <LandingSection>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionLabel>Deep dive</SectionLabel>
              <h2 className="mt-3 text-4xl font-extrabold leading-tight">
                Open once. Know what matters.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                The Today view is built for the fastest important question in
                the product: what belongs to this period, and what can I check
                right now?
              </p>
              <div className="mt-6">
                <BulletList items={todayBullets} />
              </div>
            </div>
            <ScreenshotMock
              label="Screenshot: Today view"
              title="Progress strip + grouped checklist + note pane"
            />
          </div>
        </LandingSection>

        <LandingSection>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <ScreenshotMock
              label="Screenshot: Structure surface"
              title="Quests, categories, and editor sheet"
            />
            <div>
              <SectionLabel>Deep dive</SectionLabel>
              <h2 className="mt-3 text-4xl font-extrabold leading-tight">
                Structure without spreadsheet chaos.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Add quests, group them into life areas, reorder categories, and
                keep setup close to the list instead of bouncing through admin
                screens.
              </p>
              <div className="mt-6">
                <BulletList items={structureBullets} />
              </div>
            </div>
          </div>
        </LandingSection>

        <LandingSection>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionLabel>Deep dive</SectionLabel>
              <h2 className="mt-3 text-4xl font-extrabold leading-tight">
                A system you can review without rewriting your life.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                History is not there to impress you with analytics. It is there
                to help you review, correct, and keep the system honest as your
                real routines change.
              </p>
              <div className="mt-6">
                <BulletList items={historyBullets} />
              </div>
            </div>
            <ScreenshotMock
              label="Screenshot: History view"
              title="Day-grouped feed + note editor + delete confirmation"
            />
          </div>
        </LandingSection>

        <LandingSection id="workflow">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight">
            You do not need to build a second brain to get value.
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {workflowSteps.map((step) => (
              <CardBox key={step.number}>
                <span className="inline-flex bg-primary px-3 py-1 text-xs font-bold uppercase text-primary-foreground [border-radius:var(--radius-sm)]">
                  {step.number}
                </span>
                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {step.body}
                </p>
              </CardBox>
            ))}
          </div>
          <Button asChild className="mt-7" size="lg">
            <Link href="/sign-up">Start free</Link>
          </Button>
        </LandingSection>

        <LandingSection>
          <SectionLabel>Why this category exists</SectionLabel>
          <h2 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight">
            Rythm sits between a habit app, a to-do list, and a journal.
          </h2>
          <div className="mt-8 overflow-x-auto border border-border/70 bg-background/80 shadow-sm [border-radius:var(--radius-lg)]">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="border-b border-border px-4 py-3" scope="col">
                    Capability
                  </th>
                  <th className="border-b border-border px-4 py-3" scope="col">
                    Rythm
                  </th>
                  <th className="border-b border-border px-4 py-3" scope="col">
                    Habit tracker
                  </th>
                  <th className="border-b border-border px-4 py-3" scope="col">
                    To-do app
                  </th>
                  <th className="border-b border-border px-4 py-3" scope="col">
                    Journal / spreadsheet
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row[0]}
                    className="border-b border-border/70 last:border-b-0"
                  >
                    {row.map((cell, index) => (
                      <td
                        key={`${row[0]}-${index}`}
                        className={`px-4 py-4 ${
                          index === 1
                            ? "font-bold text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LandingSection>

        <LandingSection>
          <SectionLabel>Early proof</SectionLabel>
          <h2 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight">
            People do not need more motivation. They need a system they can keep
            returning to.
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <CardBox key={testimonial.attribution}>
                <p className="text-sm leading-7 text-muted-foreground">
                  &quot;{testimonial.quote}&quot;
                </p>
                <p className="mt-5 text-sm font-bold">
                  {testimonial.attribution}
                </p>
              </CardBox>
            ))}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {testimonialStats.map((stat) => (
              <CardBox key={stat.label}>
                <p className="text-3xl font-extrabold">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </CardBox>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Placeholder data. Replace testimonials and metrics with real proof
            later.
          </p>
        </LandingSection>

        <LandingSection id="pricing">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight">
            Placeholder pricing that gives the product a believable value shape.
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
            This is not final pricing. It is a working foundation so the page
            can carry a real commercial frame before market research is
            finished.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <CardBox
                key={plan.name}
                className={plan.featured ? "border-primary shadow-xl" : ""}
              >
                {plan.featured ? (
                  <span className="inline-flex bg-primary px-3 py-1 text-xs font-bold uppercase text-primary-foreground [border-radius:var(--radius-sm)]">
                    Recommended
                  </span>
                ) : null}
                <h3 className="mt-5 text-2xl font-bold">{plan.name}</h3>
                <p className="mt-3 text-4xl font-extrabold">{plan.price}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="my-6 border-t border-border" />
                <BulletList items={plan.features} />
                <Button
                  asChild
                  className="mt-7 w-full"
                  variant={plan.featured ? "default" : "outline"}
                >
                  <Link href="/sign-up">{plan.cta}</Link>
                </Button>
              </CardBox>
            ))}
          </div>
        </LandingSection>

        <LandingSection id="faq">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight">
            Neutralize the main objections without sounding defensive.
          </h2>
          <div className="mt-8 space-y-3">
            {faqItems.map((item, index) => (
              <details
                key={item.question}
                className="group landing-card border border-border/70 px-5 py-4 shadow-sm [border-radius:var(--radius-lg)]"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span className="text-muted-foreground group-open:hidden">
                    +
                  </span>
                  <span className="hidden text-muted-foreground group-open:inline">
                    -
                  </span>
                </summary>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </LandingSection>

        <LandingSection className="text-center">
          <h2 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight">
            If you want more structure without more noise, start with a calmer
            system.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
            The right first impression is not intensity. It is relief.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-up">Start free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#workflow">See how it works</a>
            </Button>
          </div>
        </LandingSection>

        <footer className="border-t border-border/70 py-10">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 text-sm sm:px-6 md:grid-cols-4 lg:px-8">
            <div>
              <p className="font-extrabold uppercase">Rythm</p>
              <p className="mt-3 text-muted-foreground">
                Personal rhythm for recurring life commitments.
              </p>
            </div>
            <div>
              <p className="font-bold">Product</p>
              <div className="mt-3 grid gap-2 text-muted-foreground">
                <a className="hover:text-foreground" href="#why">
                  Why it works
                </a>
                <a className="hover:text-foreground" href="#pricing">
                  Pricing
                </a>
                <a className="hover:text-foreground" href="#faq">
                  FAQ
                </a>
              </div>
            </div>
            <div>
              <p className="font-bold">Company</p>
              <div className="mt-3 grid gap-2 text-muted-foreground">
                <span>About</span>
                <span>Contact</span>
                <span>Roadmap</span>
              </div>
            </div>
            <div>
              <p className="font-bold">Legal</p>
              <div className="mt-3 grid gap-2 text-muted-foreground">
                <span>Privacy</span>
                <span>Terms</span>
                <span>Status</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
