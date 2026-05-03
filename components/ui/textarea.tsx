import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow,background-color] duration-[160ms] ease-out placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
