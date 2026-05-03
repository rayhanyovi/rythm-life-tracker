"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      toastOptions={{
        classNames: {
          actionButton:
            "rounded-md bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
          cancelButton:
            "rounded-md bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
          description: "text-muted-foreground",
          error:
            "border-destructive/30 bg-card text-foreground shadow-md",
          success:
            "border-border bg-card text-foreground shadow-md",
          title: "text-sm font-semibold text-foreground",
          toast:
            "rounded-lg border border-border bg-card px-4 py-3 text-foreground shadow-md",
          warning:
            "border-border bg-card text-foreground shadow-md",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
