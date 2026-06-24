import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container-luxe relative flex min-h-[70vh] items-center justify-center py-16">
      <Link
        href="/"
        aria-label="Back to home"
        className="absolute left-5 top-6 flex items-center gap-1.5 text-xs uppercase tracking-wide2 text-stone transition-colors hover:text-ink lg:left-8"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo variant="black" href="/" className="mb-6" />
          <h1 className="font-serif text-3xl font-light uppercase tracking-wide2">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-stone">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-stone">{footer}</div>}
      </div>
    </div>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-ink underline underline-offset-4 hover:text-gold">
      {children}
    </Link>
  );
}
