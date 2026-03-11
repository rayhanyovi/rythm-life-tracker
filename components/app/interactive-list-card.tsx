import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type InteractiveListCardProps = {
  actions?: React.ReactNode;
  actionsClassName?: string;
  cardClassName?: string;
  children: React.ReactNode;
  contentClassName?: string;
  leading?: React.ReactNode;
  selected?: boolean;
};

export function InteractiveListCard({
  actions,
  actionsClassName,
  cardClassName,
  children,
  contentClassName,
  leading,
  selected = false,
}: InteractiveListCardProps) {
  return (
    <Card
      className={cn(
        selected && "border-primary/35 bg-primary/5",
        cardClassName,
      )}
    >
      <CardContent
        className={cn(
          "grid gap-4 p-5",
          leading
            ? "md:grid-cols-[auto_minmax(0,1fr)_auto]"
            : "lg:grid-cols-[minmax(0,1fr)_auto]",
          contentClassName,
        )}
      >
        {leading ? <div>{leading}</div> : null}
        <div className="min-w-0">{children}</div>
        {actions ? (
          <div
            className={cn(
              "flex flex-wrap items-start gap-2 lg:justify-end",
              actionsClassName,
            )}
          >
            {actions}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
