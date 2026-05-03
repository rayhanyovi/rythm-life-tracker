import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow,background-color] duration-[160ms] ease-out placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
