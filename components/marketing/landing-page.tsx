import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Flag,
  NotebookText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const heroMetrics = [
  {
    label: "Recurring rhythm",
    value: "Daily, weekly, monthly, and main quests in one calm system.",
  },
  {
    label: "Structured notes",
    value: "Keep context with each completion without turning the app into a journal.",
  },
  {
    label: "Quiet momentum",
    value: "See streaks clearly without XP, badges, or other gamification noise.",
  },
];

const featureCards = [
  {
    description:
      "Each quest belongs to a real cadence, so today’s checklist stays clean and relevant.",
    icon: CalendarRange,
    title: "Period-aware quests",
  },
  {
    description:
      "Group habits into life categories that feel like structure, not cluttered projects.",
    icon: Target,
    title: "Life categories",
  },
  {
    description:
      "Capture a short note when a quest needs context, correction, or reflection later.",
    icon: NotebookText,
    title: "Completion notes",
  },
  {
    description:
      "Install Rythm on mobile and keep the same focused workflow without switching products.",
    icon: Smartphone,
    title: "Installable PWA",
  },
];

const flowSteps = [
  {
    body: "Create categories like Health, Finance, or Spiritual, then define the quests that matter inside each rhythm.",
    number: "01",
    title: "Set your structure",
  },
  {
    body: "Open the dashboard, check what matters in the current period, and keep streaks visible without extra ceremony.",
    number: "02",
    title: "Move through today",
  },
  {
    body: "Review history, adjust notes, and keep your system accurate as your routines evolve.",
    number: "03",
    title: "Keep it honest",
  },
];

const previewCategories = [
  {
    items: [
      { complete: true, streak: "12 day streak", title: "Morning stretch" },
      { complete: false, streak: "4 day streak", title: "Deep work sprint" },
    ],
    name: "Health",
  },
  {
    items: [
      { complete: true, streak: "6 week streak", title: "Money review" },
      { complete: false, streak: "Main quest", title: "Ship Rythm MVP" },
    ],
    name: "Focus",
  },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="landing-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
      <Sparkles className="size-3.5" />
      {children}
    </span>
  );
}

export function LandingPage() {
  return (
    <main className="landing-shell">
      <div className="landing-grid">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between gap-4 rounded-full border border-border/60 bg-background/70 px-4 py-3 shadow-sm backdrop-blur md:px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.24em] uppercase"
            >
              <span className="landing-orbit flex size-11 items-center justify-center rounded-full border border-border/60">
                <Target className="size-5" />
              </span>
              Rythm
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              <a href="#why">Why it works</a>
              <a href="#flow">How it flows</a>
              <a href="#pwa">PWA</a>
            </nav>

            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Start free</Link>
              </Button>
            </div>
          </header>

          <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:py-20">
            <div className="landing-enter flex flex-col gap-8">
              <SectionEyebrow>Calm quest system for real life</SectionEyebrow>

              <div className="max-w-3xl space-y-6">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                  Build a rhythm you can actually keep.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                  Rythm turns recurring goals into quiet, period-based quests so
                  you can see today clearly, protect momentum, and keep your
                  life structured without habit-tracker noise.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="min-w-44">
                  <Link href="/sign-up">
                    Start with Rythm
                    <ArrowRight className="size-4.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="min-w-44">
                  <Link href="/sign-in">I already have an account</Link>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <Card
                    key={metric.label}
                    className="landing-card border-border/60 bg-background/70"
                  >
                    <CardContent className="space-y-2 px-5 py-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="text-sm leading-7 text-foreground/85">
                        {metric.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="landing-float relative">
              <div className="landing-spotlight absolute inset-x-[14%] top-5 h-20 rounded-full blur-3xl" />
              <Card className="landing-card relative overflow-hidden border-border/60">
                <CardHeader className="space-y-4 border-b border-border/60 pb-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Today&apos;s rhythm
                      </p>
                      <CardTitle className="mt-2 text-3xl">
                        Tuesday cadence
                      </CardTitle>
                    </div>
                    <div className="landing-pill rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
                      Dashboard preview
                    </div>
                  </div>
                  <CardDescription className="max-w-lg text-base text-muted-foreground">
                    Focus on what belongs to this period, not a bloated backlog.
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-6 px-6 py-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="landing-mini-panel rounded-2xl border border-border/60 p-4">
                      <div className="flex items-center gap-3">
                        <TimerReset className="size-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Current streak
                        </span>
                      </div>
                      <p className="mt-4 text-3xl font-semibold">12</p>
                    </div>
                    <div className="landing-mini-panel rounded-2xl border border-border/60 p-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="size-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Checked today
                        </span>
                      </div>
                      <p className="mt-4 text-3xl font-semibold">3 / 5</p>
                    </div>
                    <div className="landing-mini-panel rounded-2xl border border-border/60 p-4">
                      <div className="flex items-center gap-3">
                        <Flag className="size-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Main quest
                        </span>
                      </div>
                      <p className="mt-4 text-lg font-semibold">
                        Ship MVP calmly
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {previewCategories.map((category) => (
                      <section
                        key={category.name}
                        className="landing-mini-panel rounded-3xl border border-border/60 p-5"
                      >
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {category.name}
                          </h2>
                          <span className="landing-pill rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                            Active
                          </span>
                        </div>

                        <div className="space-y-3">
                          {category.items.map((item) => (
                            <div
                              key={item.title}
                              className="flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-background/75 px-4 py-3"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span
                                  className={
                                    item.complete
                                      ? "flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
                                      : "flex size-9 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground"
                                  }
                                >
                                  <CheckCircle2 className="size-4" />
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold">
                                    {item.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.streak}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                {item.complete ? "Done" : "Queued"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section
            id="why"
            className="grid gap-6 border-y border-border/60 py-12 md:grid-cols-2 xl:grid-cols-4"
          >
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={feature.title}
                  className="landing-card border-border/60 bg-background/72"
                >
                  <CardHeader className="space-y-4 pb-2">
                    <div className="landing-orbit flex size-12 items-center justify-center rounded-full border border-border/60">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <CardDescription className="text-sm leading-7">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section
            id="flow"
            className="grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"
          >
            <div className="space-y-5">
              <SectionEyebrow>How the product flows</SectionEyebrow>
              <div className="space-y-4">
                <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  A personal quest system that stays fast every day.
                </h2>
                <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                  Rythm is built for people who want structure without turning
                  their routines into a game, a spreadsheet, or a project board.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {flowSteps.map((step) => (
                <Card
                  key={step.number}
                  className="landing-card border-border/60 bg-background/72"
                >
                  <CardContent className="grid gap-4 px-6 py-6 sm:grid-cols-[auto_1fr] sm:items-start">
                    <div className="landing-orbit flex size-14 items-center justify-center rounded-full border border-border/60 text-sm font-semibold tracking-[0.18em]">
                      {step.number}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                        {step.body}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section
            id="pwa"
            className="pb-8 pt-4"
          >
            <Card className="landing-card border-border/60">
              <CardContent className="flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <div className="space-y-3">
                  <SectionEyebrow>Installable and mobile-friendly</SectionEyebrow>
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Take your rhythm with you without adding another app stack.
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                    Use Rythm in the browser, install it to your home screen,
                    and keep the exact same calm workflow on desktop or mobile.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="/sign-up">
                      Create account
                      <ArrowRight className="size-4.5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/sign-in">Open sign in</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
