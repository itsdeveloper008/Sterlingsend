import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center gap-2 border text-sm font-semibold tracking-[0.01em] whitespace-nowrap select-none",
    "rounded-[var(--radius-md)] outline-none transition-[transform,background-color,border-color,color] duration-[var(--duration-300)] ease-[var(--ease)]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-700)]",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:outline-destructive/30",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "clay-teal border-transparent text-white hover-fine:hover:-translate-y-0.5",
        outline:
          "clay-secondary text-[#0F172A] hover-fine:hover:-translate-y-0.5",
        secondary:
          "clay-secondary text-[#0F172A] hover-fine:hover:-translate-y-0.5",
        ghost: "border-transparent hover-fine:hover:bg-muted hover-fine:hover:text-foreground",
        destructive:
          "border-transparent bg-destructive/10 text-[var(--destructive-foreground)] hover-fine:hover:bg-destructive/20",
        link: "border-transparent text-[var(--brand-700)] underline-offset-4 hover:underline ",
      },
      size: {
        default: "h-[52px] px-5",
        xs: "h-8 gap-1 px-2.5 text-xs",
        sm: "h-10 gap-1.5 px-3 text-[0.8125rem]",
        lg: "clay-teal-lg h-[52px] gap-2 px-6 text-[19px] font-bold",
        icon: "size-[52px]",
        "icon-xs": "size-8",
        "icon-sm": "size-10",
        "icon-lg": "size-[52px]",
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
