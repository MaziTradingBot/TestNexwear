import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  {
    label: "Women",
    href: "/women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Men",
    href: "/men",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Shoes",
    href: "/shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    label: "Accessories",
    href: "/women?category=women-handbags",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
  },
];

export function CategoryGrid() {
  return (
    <section className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
      {CATEGORIES.map((c) => (
        <Link key={c.label} href={c.href} className="group relative block bg-white">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={c.image}
              alt={c.label}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform [transition-duration:1200ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-ink/10 transition-colors duration-500 group-hover:bg-ink/25" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="btn-label">{c.label}</span>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
