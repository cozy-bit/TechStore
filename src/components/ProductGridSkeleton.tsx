export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-surface-muted bg-surface"
        >
          <div className="aspect-[4/3] animate-pulse bg-surface-muted" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/4 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-muted" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-surface-muted" />
            <div className="flex gap-2 pt-2">
              <div className="h-10 flex-1 animate-pulse rounded-xl bg-surface-muted" />
              <div className="h-10 flex-1 animate-pulse rounded-xl bg-surface-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
