import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DetailPanelProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  description: string;
  sticky?: boolean;
  title: string;
};

export function DetailPanel({
  children,
  className,
  contentClassName,
  description,
  sticky = true,
  title,
}: DetailPanelProps) {
  return (
    <Card className={cn("h-fit", sticky && "xl:sticky xl:top-24", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
