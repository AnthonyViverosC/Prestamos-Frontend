import { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  accentClassName?: string
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accentClassName = "bg-primary",
}: StatCardProps) {
  return (
    <Card className="border-0 bg-white/95 shadow-sm shadow-slate-950/[0.03] ring-1 ring-slate-200">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{hint}</p>
          </div>
          <div
            className={cn(
              "rounded-2xl p-3 text-white shadow-sm shadow-slate-950/10",
              accentClassName,
            )}
          >
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
