import Image from "next/image";
import Link from "next/link";

const BLOCKS = [
  {
    label: "Women's Edit",
    href: "/women",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1100&q=80",
  },
  {
    label: "Men's Edit",
    href: "/men",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1100&q=80",
  },
];

export function EditorialSplit() {
  return (
    <section>
      <div className="mb-10 text-center">
        <p className="eyebrow mb-3">Curated</p>
        <h2 className="section-title">Shop The Edit</h2>
      </div>
      <div className="grid grid-cols-1 gap-px bg-line md:grid-cols-2">
        {BLOCKS.map((b) => (
          <Link key={b.label} href={b.href} className="group relative block bg-white">
            <div className="relative aspect-[4/5] overflow-hidden md:aspect-[3/4]">
              <Image
                src={b.image}
                alt={b.label}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform [transition-duration:1200ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end justify-center pb-10">
                <span className="btn-label">{b.label}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
