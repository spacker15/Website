"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: string;
};

export const Switch = React.forwardRef<HTMLInputElement, Props>(function Switch(
  { className, label, id, checked, defaultChecked, ...props },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-3 select-none cursor-pointer",
        className,
      )}
    >
      <span className="relative inline-block h-6 w-11 shrink-0">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand-teal-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-teal peer-focus-visible:ring-offset-2"
        />
        <span
          aria-hidden
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
        />
      </span>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  );
});
