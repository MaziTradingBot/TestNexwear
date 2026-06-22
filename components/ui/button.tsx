import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wide2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-ink text-white hover:bg-charcoal active:scale-[0.99]",
        outline: "border border-ink bg-transparent text-ink hover:bg-ink hover:text-white",
        gold: "bg-gold text-white hover:bg-gold-dark",
        ghost: "text-ink hover:text-gold",
        subtle: "bg-bone text-ink hover:bg-sand",
      },
      size: {
        sm: "px-5 py-2.5 text-[0.7rem]",
        md: "px-8 py-3.5 text-[0.78rem]",
        lg: "px-10 py-4 text-[0.82rem]",
        icon: "h-10 w-10 p-0",
      },
      full: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, full }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
