"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "neu peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border p-0.5 transition-[background-color,box-shadow] duration-[var(--duration-150)] ease-[var(--ease)]",
        "data-checked:bg-[var(--brand-700)] data-unchecked:bg-muted",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-white shadow-[var(--shadow-1)] transition-transform duration-[var(--duration-150)] ease-[var(--ease)]",
          "data-checked:translate-x-5 data-unchecked:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
