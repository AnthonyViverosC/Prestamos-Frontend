import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-28 w-full rounded-2xl border border-input bg-white/90 px-4 py-3 text-sm text-foreground shadow-sm shadow-slate-950/[0.02] outline-none placeholder:text-muted-foreground/90 hover:border-slate-300 focus-visible:border-ring focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-ring/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
