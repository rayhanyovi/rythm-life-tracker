import * as React from "react";

import { cn } from "@/lib/utils";

type PageIntroProps = {
  actions?: React.ReactNode;
  className?: string;
  description: string;
  eyebrow?: string;
  title: string;
};

export function PageIntro({
  actions,
  className,
  description,
  eyebrow,
  title,
}: PageIntroProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
