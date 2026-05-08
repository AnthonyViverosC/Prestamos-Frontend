import { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description: string
  eyebrow?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-950/[0.03] backdrop-blur-sm lg:flex-row lg:items-end lg:justify-between lg:p-6",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <Badge variant="outline" className="mb-3 rounded-full px-3 py-1">
            {eyebrow}
          </Badge>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 md:text-[15px]">
          {description}
        </p>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      )}
    </div>
  )
}
