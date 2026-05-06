export function AuthShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)]">
      <section className="app-auth-panel hidden border-r border-border/70 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Rythm access
            </p>
            <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-foreground">
              Return to the tasks that shape your day.
            </h1>
            <p className="max-w-xl text-base leading-8 text-muted-foreground">
              Sign in, recover access, and get back to Today without turning
              account work into a detour.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              "Current-period checklist",
              "Lists and Habit Lists stay ordered",
              "Quiet recovery when access needs to be restored",
            ].map((item) => (
              <div
                key={item}
                className="rounded-md border border-border/70 bg-background/75 px-5 py-4 text-sm text-foreground shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="max-w-md text-sm leading-7 text-muted-foreground">
          Better Auth handles the session boundary; Rythm keeps the first stop
          focused on Today.
        </p>
      </section>
      <div className="flex items-center justify-center px-5 py-10 md:px-8">
        {children}
      </div>
    </div>
  );
}
