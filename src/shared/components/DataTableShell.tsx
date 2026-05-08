import { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface DataTableShellProps {
  title: string
  subtitle?: string
  loading?: boolean
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function DataTableShell({
  title,
  subtitle,
  loading,
  children,
  footer,
  className,
}: DataTableShellProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-950/[0.03]",
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        {loading && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        )}
      </div>

      {children}

      {footer && (
        <div className="border-t border-slate-200 bg-slate-50/80 px-5 py-4">
          {footer}
        </div>
      )}
    </section>
  )
}
