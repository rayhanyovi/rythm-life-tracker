import * as React from "react";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageShellProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              {description}
            </p>
          </div>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
