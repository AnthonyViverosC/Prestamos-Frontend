import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-2xl bg-[linear-gradient(90deg,rgba(226,232,240,0.7)_25%,rgba(241,245,249,0.95)_50%,rgba(226,232,240,0.7)_75%)] bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
