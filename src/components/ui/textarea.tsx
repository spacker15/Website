import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-32 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:border-brand-teal disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
