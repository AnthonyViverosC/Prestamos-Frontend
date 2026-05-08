import { ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  id?: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function FormField({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium text-slate-800">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {hint && <p className="text-xs leading-5 text-slate-500">{hint}</p>}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
