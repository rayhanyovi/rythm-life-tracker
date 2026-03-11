export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)]">
      <section className="hidden border-r border-border/70 bg-[linear-gradient(180deg,oklch(0.968_0.018_89),oklch(0.932_0.025_83))] px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Rythm foundation
            </p>
            <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-foreground">
              A quieter, clearer home for recurring life quests.
            </h1>
            <p className="max-w-xl text-base leading-8 text-muted-foreground">
              This shell keeps the structure from the prototype while shifting
              the feel toward something warmer, steadier, and more grounded.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              "Fast current-period checklist",
              "Clean quest grouping by category",
              "Room for streaks, notes, and simple history",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[calc(var(--radius)-0.15rem)] border border-border/70 bg-background/75 px-5 py-4 text-sm text-foreground shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="max-w-md text-sm leading-7 text-muted-foreground">
          Better Auth integration and server-side session flow are intentionally
          split into the next vertical slice so the app shell stays stable while
          the data boundary is introduced.
        </p>
      </section>
      <div className="flex items-center justify-center px-5 py-10 md:px-8">
        {children}
      </div>
    </div>
  );
}
