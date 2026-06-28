import Image from "next/image";
import Link from "next/link";

type Banner = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageUrl: string;
};

/** Renders admin-managed promo banners on the home page. */
export function PromoBanners({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;
  return (
    <section className="container-luxe space-y-6">
      {banners.map((b) => {
        const Wrapper = b.ctaHref ? Link : "div";
        return (
          <Wrapper key={b.id} href={b.ctaHref ?? "#"} className="group relative block overflow-hidden">
            <div className="relative aspect-[21/9] w-full">
              <Image
                src={b.imageUrl}
                alt={b.title}
                fill
                sizes="100vw"
                className="object-cover transition-transform [transition-duration:1400ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-ink/35" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                {b.eyebrow && <p className="eyebrow mb-3 text-white/80">{b.eyebrow}</p>}
                <h2 className="font-serif text-4xl font-light uppercase tracking-wide2 md:text-6xl">{b.title}</h2>
                {b.subtitle && <p className="mt-3 max-w-xl text-sm text-white/85">{b.subtitle}</p>}
                {b.ctaLabel && <span className="btn-label mt-7">{b.ctaLabel}</span>}
              </div>
            </div>
          </Wrapper>
        );
      })}
    </section>
  );
}
