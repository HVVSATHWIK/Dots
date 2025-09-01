import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-background px-4 py-3 text-base text-foreground shadow-sm placeholder:text-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neonaccent/20 focus-visible:border-neonaccent disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-400 resize-none md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
