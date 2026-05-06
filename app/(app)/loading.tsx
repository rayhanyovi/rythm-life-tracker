import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-48 max-w-full" />
          <Skeleton className="h-4 w-[28rem] max-w-full" />
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-11 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-11 w-full" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        <div className="overflow-hidden rounded-lg border border-border/80 bg-card/95 shadow-sm">
          <div className="border-b border-border/70 px-4 py-3">
            <Skeleton className="h-4 w-28" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-3 border-b border-border/70 px-4 py-3.5 last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
            >
              <Skeleton className="size-6 rounded-full" />
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden xl:block">
        <div className="sticky top-5 rounded-lg border border-border/80 bg-card/95 p-5 shadow-xs">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="mt-5 space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
