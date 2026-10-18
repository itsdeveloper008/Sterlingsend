import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[background-color,border-color,color] duration-[var(--duration-150)] ease-[var(--ease)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)] [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--brand-700)] text-white [a]:hover:bg-[var(--primary-hover)]",
        secondary:
          "border-border bg-secondary text-secondary-foreground [a]:hover:bg-accent",
        destructive:
          "border-transparent bg-destructive/10 text-[var(--destructive-foreground)]",
        outline: "border-border text-foreground [a]:hover:bg-muted",
        success:
          "border-transparent bg-success/10 text-[var(--success-foreground)]",
        warning:
          "border-transparent bg-warning/10 text-[var(--warning-foreground)]",
        ghost: "border-transparent hover:bg-muted hover:text-muted-foreground",
        link: "border-transparent text-[var(--brand-700)] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
