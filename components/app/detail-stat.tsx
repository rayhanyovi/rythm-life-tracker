import * as React from "react";

import { cn } from "@/lib/utils";

type DetailStatProps = {
  className?: string;
  label: string;
  value: React.ReactNode;
};

export function DetailStat({ className, label, value }: DetailStatProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border/75 bg-background/75 p-4",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
