import { cn } from "@/lib/cn";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "sale" | "new" | "gold";
  className?: string;
}) {
  const styles = {
    default: "bg-ink text-white",
    sale: "bg-sale text-white",
    new: "bg-white text-ink border border-ink",
    gold: "bg-gold text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wide2",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
