import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  className?: string;
  label: string;
  value: React.ReactNode;
};

export function MetricCard({ className, label, value }: MetricCardProps) {
  return (
    <Card className={cn("bg-background/70 shadow-sm", className)}>
      <CardContent className="space-y-2 p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
