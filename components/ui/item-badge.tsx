import { cn } from "@/lib/utils";

export function ItemBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-lg border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.04em] text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
