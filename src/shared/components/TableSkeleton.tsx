import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton({
  rows = 6,
  columns = 6,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div className="space-y-3 px-5 py-5">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className="h-11 rounded-2xl"
            />
          ))}
        </div>
      ))}
    </div>
  )
}
