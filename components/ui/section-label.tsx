import { getCategoryColor } from "@/lib/category-colors";

export function SectionLabel({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 px-5 pb-1.5 pt-4">
      <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: getCategoryColor(label) }}
        />
        {label}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">
        {count}
      </span>
    </div>
  );
}
