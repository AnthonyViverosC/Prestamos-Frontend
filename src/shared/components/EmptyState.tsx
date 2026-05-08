import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-[26px] border border-dashed border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-10 text-center",
        className,
      )}
    >
      <div className="mb-4 rounded-3xl bg-slate-100 p-4 text-slate-500">
        <Icon size={28} strokeWidth={1.6} />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
