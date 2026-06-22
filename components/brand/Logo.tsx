import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "black" | "white" | "gold";

const COLORS: Record<Variant, string> = {
  black: "#0A0A0A",
  white: "#FFFFFF",
  gold: "#B8995A",
};

/**
 * NexWear brand lockup — geometric "NX" monogram + NEXWEAR wordmark.
 * Renders inline SVG so it stays crisp at any size and inherits theme colors.
 */
export function Logo({
  variant = "black",
  showWordmark = true,
  href = "/",
  className,
}: {
  variant?: Variant;
  showWordmark?: boolean;
  href?: string | null;
  className?: string;
}) {
  const color = COLORS[variant];

  const content = (
    <span className={cn("inline-flex items-center gap-2.5 leading-none", className)}>
      <svg
        viewBox="0 0 230 120"
        className="h-7 w-auto"
        fill="none"
        aria-hidden="true"
      >
        <g
          stroke={color}
          strokeWidth={13}
          strokeLinecap="square"
          strokeLinejoin="miter"
        >
          <path d="M30 95 V25 L80 95 V25" />
          <path d="M140 25 L200 95 M200 25 L140 95" />
        </g>
        <rect x="6" y="6" width="218" height="108" fill="none" stroke={color} strokeWidth={2} />
      </svg>
      {showWordmark && (
        <span
          className="font-serif text-2xl font-medium uppercase tracking-[0.3em]"
          style={{ color }}
        >
          NexWear
        </span>
      )}
    </span>
  );

  if (href === null) return content;
  return (
    <Link href={href} aria-label="NexWear — home">
      {content}
    </Link>
  );
}
