import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center gap-2 border text-sm font-semibold whitespace-nowrap select-none",
    "rounded-[var(--radius-md)] outline-none transition-[transform,box-shadow,background-color,border-color,color] duration-[var(--duration-150)] ease-[var(--ease)]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)]",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:outline-destructive/30",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--brand-700)] text-white shadow-[var(--shadow-1)] hover-fine:hover:-translate-y-0.5 hover-fine:hover:bg-[var(--primary-hover)] hover-fine:hover:shadow-[var(--shadow-2)]",
        outline:
          "border-border bg-background text-foreground shadow-[var(--shadow-1)] hover-fine:hover:-translate-y-0.5 hover-fine:hover:bg-muted hover-fine:hover:shadow-[var(--shadow-2)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover-fine:hover:bg-accent",
        ghost: "border-transparent hover-fine:hover:bg-muted hover-fine:hover:text-foreground",
        destructive:
          "border-transparent bg-destructive/10 text-[var(--destructive-foreground)] hover-fine:hover:bg-destructive/20",
        link: "border-transparent text-[var(--brand-700)] underline-offset-4 hover:underline dark:text-[var(--brand-500)]",
      },
      size: {
        default: "h-10 px-4",
        xs: "h-7 gap-1 px-2.5 text-xs",
        sm: "h-9 gap-1.5 px-3 text-[0.8125rem]",
        lg: "h-11 gap-2 px-5 text-base",
        icon: "size-10",
        "icon-xs": "size-7",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
