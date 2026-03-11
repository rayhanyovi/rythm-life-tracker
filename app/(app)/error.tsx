"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
            <AlertTriangle className="size-5" />
          </span>
          Something slipped out of rhythm
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          The root app shell is set up to recover cleanly from route-level
          errors. Try the render again, then inspect the error details if it
          persists.
        </p>
        <div className="rounded-[calc(var(--radius)-0.25rem)] bg-muted/70 p-4 text-sm text-muted-foreground">
          {error.message}
        </div>
        <Button onClick={reset}>Try again</Button>
      </CardContent>
    </Card>
  );
}
