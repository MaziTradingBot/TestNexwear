import Link from "next/link";

export function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "View All",
  centered = false,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  centered?: boolean;
}) {
  if (centered) {
    return (
      <div className="mb-10 text-center">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
      </div>
    );
  }
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-serif text-2xl font-light uppercase tracking-wide2 text-ink md:text-3xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="link-underline shrink-0 text-[0.7rem] font-medium uppercase tracking-wide2 text-ink"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
