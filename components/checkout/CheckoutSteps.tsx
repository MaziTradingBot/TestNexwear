import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

const STEPS = ["Shipping", "Payment", "Confirmation"];

export function CheckoutSteps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="mx-auto mb-10 flex max-w-xl items-center justify-between">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center border text-xs",
                  done && "border-ink bg-ink text-white",
                  active && "border-ink text-ink",
                  !done && !active && "border-line text-mist",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[0.7rem] font-medium uppercase tracking-wide2",
                  active ? "text-ink" : "text-mist",
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <span className={cn("mx-3 h-px flex-1", done ? "bg-ink" : "bg-line")} />}
          </li>
        );
      })}
    </ol>
  );
}
