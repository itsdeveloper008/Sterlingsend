import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-base outline-none transition-[border-color,box-shadow,background-color] duration-[var(--duration-150)] ease-[var(--ease)] placeholder:text-muted-foreground focus-visible:border-[var(--brand-500)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)] disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50 aria-invalid:border-destructive md:text-sm ",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
