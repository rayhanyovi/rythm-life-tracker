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
          <span className="flex size-11 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
            <AlertTriangle className="size-5" />
          </span>
          Something interrupted this view
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Try loading this view again. If it keeps failing, keep this message
          for debugging.
        </p>
        <div className="rounded-lg bg-muted/70 p-4 text-sm text-muted-foreground">
          {error.message}
        </div>
        <Button onClick={reset}>Try again</Button>
      </CardContent>
    </Card>
  );
}
