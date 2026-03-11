"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      toastOptions={{
        classNames: {
          actionButton:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton:
            "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          description: "text-muted-foreground",
          error:
            "border-destructive/30 bg-card text-foreground shadow-lg",
          success:
            "border-border bg-card text-foreground shadow-lg",
          title: "text-sm font-semibold text-foreground",
          toast:
            "rounded-2xl border border-border bg-card px-4 py-3 text-foreground shadow-lg",
          warning:
            "border-border bg-card text-foreground shadow-lg",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
